import {Injectable, Injector} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {IDiscount} from "../models/interfaces/discount.interface";
import {Discount} from "../models/discount.model";
import * as moment from "moment";
import {Router} from "@angular/router";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {SearchResult} from "../lib/search-result";
import {ObjectObservable} from "app/lib/object-observable";
import {ProductType} from "../models/product-type.model";
import {ProductTypeService} from "./product-type.service";
import {ProductService} from "./product.service";
import {PackageService} from "./package.service";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {DateRange} from "../lib/date-range";
import {PatientGroupService} from "./patient-group.service";
import {Cart} from "../models/cart.model";
import {StoreService} from "./store.service";
import {IStore} from "../models/interfaces/store.interface";
import {UserService} from "./user.service";
import {SupplierService} from "./supplier.service";

@Injectable()
@Mixin([SearchableService])
export class DiscountService extends CommonService<IDiscount> implements SearchableService<IDiscount> {

    private store: IStore;

    userService: UserService;

    constructor(
        injector: Injector,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        private packageService: PackageService,
        private patientGroupService: PatientGroupService,
        private storeService: StoreService,
        private supplierService: SupplierService
     ) {
        super(injector, 'discounts');

        this.storeService.currentStoreEmitted.subscribe(store => this.store = store)

        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
            this.userService.userEmitted.subscribe((u) => {
                if(u){
                    this.refreshEmitted.subscribe(() => {
                        this.all();
                    });
                }
            });
        });
    }

    private discounts = new Subject<Observable<IDiscount>[]>();

    all(): Observable<Observable<IDiscount>[]> {

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                this.discounts.next(objects);
            });

        return this.discounts.asObservable()
    }

    allAutomatic(): Observable<Observable<IDiscount>[]>{

        let discounts = new Subject<Observable<IDiscount>[]>();

        this.socket.emitPromise('allAutomatic')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                discounts.next(objects);
            });

        return discounts.asObservable();
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IDiscount>>;

    active(cart: Cart, manualCode: string, customDiscounts: IDiscount[], loyaltyDiscounts: IDiscount[]): Observable<void> {
        return this.allAutomatic()
            .take(1) //TODO handle discount changes
            .switchMap(allDiscounts => Observable.combineLatest<IDiscount[]>(allDiscounts.length ? allDiscounts : Observable.of([])))
            .map(allDiscounts => {
                let allDiscountsWithCustom = allDiscounts.slice();

                if(customDiscounts.length){
                    for(let customDiscount of customDiscounts){
                        allDiscountsWithCustom.push(customDiscount);
                    }
                }

                if(loyaltyDiscounts.length){
                    for(let discount of loyaltyDiscounts){
                        allDiscountsWithCustom.push(discount);
                    }
                }

                let totalByDiscount = Object.create(null);
                for(let lineItem of cart.lineItems) {

                    console.log(lineItem);

                    lineItem.discountAmount = 0;
                    lineItem.Discount = undefined;
                    lineItem.discountId = undefined;

                    for(let transaction of lineItem.Transactions) {
                        transaction.discountAmount = 0;
                        transaction.discountId = undefined;
                    }

                    if( !lineItem.isReturn ) {

                      let bestDiscount: [number, IDiscount] = undefined;

                      for(let discount of allDiscountsWithCustom) {

                          if (lineItem.skipDiscountInPOSCart && lineItem.skipDiscountInPOSCart.length && lineItem.skipDiscountInPOSCart.find(skipDiscount => skipDiscount.discountId === discount.id)) {
                              continue;
                          }

                          if(!discount.isActive) {
                              continue;
                          }

                          if(discount.startDate && (discount.startDate > new Date() || discount.endDate < new Date())) {
                              continue;
                          }

                          if(!lineItem.Product.eligibleForDiscount && !discount.isOverride) {
                              continue;
                          }

                          if(discount.productTypeId && lineItem.Product.productTypeId != discount.productTypeId) {
                              continue;
                          }

                          if(discount.productId && lineItem.productId != discount.productId) {
                              continue;
                          }

                          if(discount.productVariationId && lineItem.productVariationId != discount.productVariationId){
                              continue;
                          }

                          if(discount.supplierId && lineItem.Product.Item.Supplier.id != discount.supplierId){
                              continue;
                          }

                          if(discount.lineItemId && lineItem.id != discount.lineItemId){
                              continue;
                          }

                          if(discount.thcType && discount.thcType != 'all' &&
                              ( lineItem.Product.ProductType.category === 'non-cannabis' && discount.thcType === 'thc' ) || ( lineItem.Product.ProductType.category !== 'non-cannabis' && discount.thcType === 'non-thc' )
                          ) {
                              continue;
                          }

                          let nowTime = moment().format('HH:mm');
                          if(discount.startTime) {
                              let startTime = moment(discount.startTime).format('HH:mm');
                              let endTime = moment(discount.endTime).format('HH:mm');

                              if(startTime > nowTime || endTime < nowTime) {
                                  continue;
                              }

                          }

                          let todayName = moment().format('ddd').toLowerCase();
                          if(discount.days.length && discount.days.indexOf(todayName) == -1) {
                              continue;
                          }

                          let hasPackage = false;
                          for(let transaction of lineItem.Transactions){
                              if(transaction.packageId == discount.packageId){
                                  hasPackage = true;
                                  break;
                              }
                          }

                          if(discount.packageId && (!lineItem.Transactions.length || !hasPackage)) {
                              continue;
                          }

                          if (discount.minimumType == 'items' && lineItem.quantity < discount.minimum) {
                              continue;
                          }
                          else if(discount.minimumType == 'price' && lineItem.price < discount.minimum) {
                              continue;
                          }

                          if(discount.amountType == 'dollar') {
                              let discountAmount = discount.amount;

                              if(discount.maximum && discountAmount > discount.maximum){
                                  discountAmount = discount.maximum;
                              }

                              // if(!bestDiscount || discountAmount > bestDiscount[0]) {
                              //     bestDiscount = [discountAmount, discount];
                              // }
                              //Custom discounts take precedence over manually applied discounts (non custom)

                              if(!bestDiscount){
                                  bestDiscount = [discountAmount, discount];
                              }else if(!bestDiscount[1].isCustom && discount.isCustom){
                                  bestDiscount = [discountAmount, discount];
                              }else if(bestDiscount[1].isCustom && discount.isCustom && discountAmount > bestDiscount[0]){
                                  bestDiscount = [discountAmount, discount];
                              }else if(!bestDiscount[1].isCustom && !discount.isCustom && discountAmount > bestDiscount[0]){
                                  bestDiscount = [discountAmount, discount];
                              }
                              continue;
                          }
                          else if(discount.amountType == 'percent') {
                              let dollarDiscount = lineItem.price * (discount.amount * 0.01);

                              if(discount.maximum && dollarDiscount > discount.maximum){
                                  dollarDiscount = discount.maximum;
                              }

                              // if(!bestDiscount || dollarDiscount > bestDiscount[0]) {
                              //     bestDiscount = [dollarDiscount, discount];
                              // }
                              //Custom discounts take precedence over manually applied discounts (non custom)

                              if(!bestDiscount){
                                  bestDiscount = [dollarDiscount, discount];
                              }else if(!bestDiscount[1].isCustom && discount.isCustom){
                                  bestDiscount = [dollarDiscount, discount];
                              }else if(bestDiscount[1].isCustom && discount.isCustom && dollarDiscount > bestDiscount[0]){
                                  bestDiscount = [dollarDiscount, discount];
                              }else if(!bestDiscount[1].isCustom && !discount.isCustom && dollarDiscount > bestDiscount[0]){
                                  bestDiscount = [dollarDiscount, discount];
                              }
                              continue;
                          }
                        }

                        if(bestDiscount) {

                            let [dollarDiscount, discount] = bestDiscount;

                            if(!totalByDiscount[discount.id]) {
                                totalByDiscount[discount.id] = 0;
                            }

                            if(discount.maximum && totalByDiscount[discount.id] + dollarDiscount > discount.maximum) {
                                dollarDiscount = discount.maximum - totalByDiscount[discount.id];
                            }
                            totalByDiscount[discount.id] += dollarDiscount;

                            lineItem.discountAmount = dollarDiscount;
                            lineItem.discountId = discount.id;
                            lineItem.Discount = discount;

                            lineItem.Transactions.forEach( transaction => {
                              transaction.discountAmount = dollarDiscount;
                              transaction.discountId = discount.id;
                              transaction.TotalPrice = lineItem.price - ( transaction.discountAmount || 0 )
                            } )
                        }
                      }
                  }
            })
    }

    getByCode(code: string){
        let result = new Subject<ObjectObservable<IDiscount>>();

        this.socket.emitPromise('getByCode', code)
            .then(discountId => {
                if(discountId) {
                    result.next(this.getAssociated(discountId));
                }else{
                    result.next(null);
                }
            });

        return result.asObservable();
    }

    newInstance() {
        return new Discount({
            id: uuid.v4(),
            version: 0,

            name: '',
            code: undefined,

            amountType: 'percent',
            amount: 0,

            minimumType: 'items',
            minimum: 1,

            maximum: undefined,

            startDate: null,
            endDate: null,

            startTime: null,
            endTime: null,

            days: [],
            patientType: 'all',
            patientGroupId: undefined,
            productTypeId: undefined,
            productId: undefined,
            packageId: undefined,
            productVariationId: undefined,
            lineItemId: undefined,
            supplierId: undefined,
            isActive: true,
            isAutomatic: true,
            isCustom: false,
            isOverride: false,
            managerApproval: false,
            thcType: 'all',
            notes: ''
        });
    }

    dbInstance(fromDb: IDiscount) {
        return new Discount(fromDb);
    }

    instanceForSocket(object: IDiscount) {
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            code: object.code,

            amountType: object.amountType,
            amount: object.amount,

            minimumType: object.minimumType,
            minimum: object.minimum,

            maximum: object.maximum,

            startDate: object.startDate,
            endDate: object.endDate,

            startTime: object.startTime,
            endTime: object.endTime,

            days: object.days,
            patientType: object.patientType,
            patientGroupId: object.patientGroupId,
            productTypeId: object.productTypeId,
            productId: object.productId,
            packageId: object.packageId,
            productVariationId: object.productVariationId,
            lineItemId: object.lineItemId,
            supplierId: object.supplierId,
            isActive: object.isActive,
            isAutomatic: object.isAutomatic,
            isCustom: object.isCustom,
            isOverride: object.isOverride,
            managerApproval: object.managerApproval,
            thcType: object.thcType,
            notes: object.notes
        }
    }

    resolveAssociations(discount: IDiscount): ObjectObservable<IDiscount> {

        let obs: Observable<IDiscount>;

        if(discount.productTypeId) {

            obs = Observable.combineLatest(
                this.productTypeService.get(discount.productTypeId),
                discount.patientGroupId ? this.patientGroupService.get(discount.patientGroupId) : Observable.of(undefined),
                (productType, patientGroup) => {
                    discount.ProductType = productType;
                    discount.Product = undefined;
                    discount.Package = undefined;
                    discount.Supplier = undefined;

                    discount.PatientGroup = patientGroup;

                    return discount;
                }
            );
        }
        else if(discount.productId) {

            obs = Observable.combineLatest(
                this.productService.get(discount.productId),
                discount.patientGroupId ? this.patientGroupService.get(discount.patientGroupId) : Observable.of(undefined),
                (product, patientGroup) => {
                    discount.ProductType = undefined;
                    discount.Product = product;
                    discount.Package = undefined;
                    discount.Supplier = undefined;

                    discount.PatientGroup = patientGroup;

                    return discount;
                }
            );

        }
        else if(discount.packageId) {

            obs = Observable.combineLatest(
                this.packageService.get(discount.packageId),
                discount.patientGroupId ? this.patientGroupService.get(discount.patientGroupId) : Observable.of(undefined),
                (_package, patientGroup) => {
                    discount.ProductType = undefined;
                    discount.Product = undefined;
                    discount.Package = _package;
                    discount.Supplier = undefined;

                    discount.PatientGroup = patientGroup;

                    return discount;
                }
            );
        }else if(discount.supplierId){
            obs = Observable.combineLatest(
                this.supplierService.get(discount.supplierId),
                discount.patientGroupId ? this.patientGroupService.get(discount.patientGroupId) : Observable.of(undefined),
                (supplier, patientGroup) => {
                    discount.ProductType = undefined;
                    discount.Product = undefined;
                    discount.Package = undefined;
                    discount.Supplier = supplier;

                    discount.PatientGroup = patientGroup;

                    return discount;
                }
            )
        }
        else {
            if(discount.patientGroupId){

                obs = this.patientGroupService.get(discount.patientGroupId)
                    .map(patientGroup => {
                        discount.ProductType = undefined;
                        discount.Product = undefined;
                        discount.Package = undefined;
                        discount.Supplier = undefined;

                        discount.PatientGroup = patientGroup;

                        return discount;
                    })

            }else{
                obs = Observable.of(discount);
            }
        }

        return new ObjectObservable(obs, discount.id);
    }

    create() {
        this.router.navigate(['admin', 'store', 'discounts', 'add']);
    }

    edit(object: IDiscount) {
        this.router.navigate(['admin', 'store', 'discounts', 'edit', object.id])
    }

    view(object: IDiscount) {
        this.router.navigate(['admin', 'store', 'discounts', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'store', 'discounts']);
    }

    cancelEdit(store: IDiscount) {
        this.router.navigate(['admin', 'store', 'discounts']);
    }

    save(store: IDiscount, navigateToIndex: boolean = true) {
        super.save(store);

        if(navigateToIndex) {
            this.router.navigate(['admin', 'store', 'discounts']);
        }
    }

    remove(discount: IDiscount){
        this.socket.emitPromise('remove', discount.id);
        this.router.navigate(['admin', 'store', 'discounts']);
    }

    getReportData(type: String, dateRange: Observable<DateRange>): Observable<any> {
        return dateRange
            .switchMap(dateRange => {
                if(!dateRange.startDate) return Promise.resolve()
                return this.socket.emitPromise('discount-data-' + type, {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            });
    }

    downloadReport(args){
        return this.socket.emitPromise('download-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }
}
