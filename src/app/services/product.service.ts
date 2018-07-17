import {Injectable, Injector} from "@angular/core";
import {Product} from "../models/product.model";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import {IProduct} from "../models/interfaces/product.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ObjectObservable} from "../lib/object-observable";
import {SearchResult} from "../lib/search-result";
import {Router} from "@angular/router";
import {ProductVariationService} from "./product-variation.service";
import {SearchableService} from "app/services/searchable.service";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Mixin} from "../lib/decorators/class/mixin";
import {ItemService} from "./item.service";
import {DateRange} from "../lib/date-range";
import {PricingTierService} from "./pricing-tier.service";
import {StoreService} from "./store.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {TagService} from "./tag.service";
import {IStore} from "../models/interfaces/store.interface";

@Injectable()
@Mixin([SearchableService])
export class ProductService extends CommonService<IProduct> implements SearchableService<IProduct> {

    private store: IStore;

    constructor(
        injector: Injector,
        private productTypeService: ProductTypeService,
        private productVariationService: ProductVariationService,
        private itemService: ItemService,
        private pricingTierService: PricingTierService,
        private storeService: StoreService,
        private tagService: TagService
    ) {
        super(injector, 'products');

        this.storeService.currentStoreEmitted.subscribe( store => this.store = store )
    }

    private product = new Subject<Observable<IProduct>[]>();

    search: (query: string, page: number, sortBy: SortBy, cannabisCategory?: string) => Observable<SearchResult<IProduct>>;

    getUploadParams(): Promise<any> {
        return this.socket.emitPromise('get-s3-upload-params')
    }

    getByPackageId(packageId: string): Observable<ObjectObservable<IProduct>>{

        let results = new Subject<ObjectObservable<IProduct>>();

        this.socket.emitPromise('getByPackageId', packageId)
            .then(productId => {
                results.next(this.getAssociated(productId));
            });

        return results.asObservable()

    }

    newInstance() {
        return new Product({
            id: uuid.v4(),
            version: 0,

            clientId: '',
            storeId: this.store.id,

            name: '',
            description: '',
            image: '',
            inventoryType: 'weight',

            productTypeId: '',
            itemId: '',
            pricingTierId: null,

            eligibleForDiscount: true,
            displayOnMenu: true,

            Tags: []
        });
    }
    dbInstance(fromDb: IProduct) {
        return new Product(fromDb);
    }

    instanceForSocket(object: IProduct): IProduct {
        return {
            id: object.id,
            version: object.version,

            clientId: object.clientId,
            storeId: object.storeId,

            name: object.name,
            description: object.description,
            image: object.image,
            inventoryType: object.inventoryType,

            productTypeId: object.productTypeId,
            itemId: object.itemId,
            pricingTierId: object.pricingTierId,

            eligibleForDiscount: object.eligibleForDiscount,
            displayOnMenu: object.displayOnMenu,

            Tags: object.Tags || [],
        }
    }

    resolveAssociations(product: IProduct, scopes: Array<string> = ['productType', 'productVariations', 'item', 'pricingTier', 'store', 'tag']): ObjectObservable<IProduct> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'productType': {
                // Key in parent Object => resolver function that must return observable
                'ProductType': () => product.productTypeId ? this.productTypeService.get(product.productTypeId) : Observable.of(undefined)
            },
            'productVariations': {
                'ProductVariations': () => this.productVariationService.getByProductId(product.id)
            },
            'item': {
                'Item': () => product.itemId ? this.itemService.get(product.itemId) : Observable.of(undefined)
            },
            'pricingTier': {
                'PricingTier': () => product.pricingTierId ? this.pricingTierService.getAssociated(product.pricingTierId) : Observable.of(undefined)
            },
            'store': {
                'Store': () => product.storeId ? this.storeService.get(product.storeId) : Observable.of(undefined)
            },
            'tag': {
                'Tags': () => this.tagService.getByProductId(product.id)
            },
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(product), product.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);

                if (!vars['Tags']) {
                    vars['Tags'] = [];
                }

                if (!vars['productVariations'] || !vars['productVariations'].length) {
                    return Observable.of(this.mapAssociationsObject(product, vars, resolversToResolve));
                } else {
                    return Observable.combineLatest(vars['productVariations'], (...productVariations) => {
                        vars['productVariations'] = productVariations;
                        return this.mapAssociationsObject(product, vars, resolversToResolve);
                    });
                }
            });

        return new ObjectObservable(obs, product.id);

    }

    resolveAssociationsLegacy(product: IProduct): ObjectObservable<IProduct> {

        let obs = Observable.combineLatest(
            this.productTypeService.get(product.productTypeId),
            this.productVariationService.getByProductId(product.id),
            product.itemId ? this.itemService.get(product.itemId) : Observable.of(undefined),
            product.pricingTierId ? this.pricingTierService.getAssociated(product.pricingTierId) : Observable.of(undefined),
            product.storeId ? this.storeService.get(product.storeId) : Observable.of(undefined) //storeId should always be set (or maybe it should just be clientId)
        ).switchMap(([productType, productVariationObservables, item, pricingTier,store]) => {

            if(!productVariationObservables.length) {
                product.ProductType = productType;
                product.Item = item;
                product.PricingTier = pricingTier;
                product.Store = store;
                return Observable.of(product);
            }

            return Observable.combineLatest(productVariationObservables, (...productVariations) => {
                product.ProductType = productType;
                product.ProductVariations = productVariations;
                product.Item = item;
                product.PricingTier = pricingTier;
                product.Store = store;

                return product;
            });
        });

        return new ObjectObservable(obs, product.id);

    }

    create() {
        this.router.navigate(['admin', 'inventory', 'products', 'add']);
    }

    edit(object: IProduct) {
        this.router.navigate(['admin', 'inventory', 'products', 'edit', object.id])
    }

    view(object: IProduct) {
        this.router.navigate(['admin', 'inventory', 'products', 'view', object.id])
    }

    list() {
        this.router.navigate(['admin', 'inventory', 'products']);
    }

    save(product: IProduct, goToEdit: boolean = false, noRedirect?: boolean, callback?, customSaveMessage?: string) {

        super.save(product, callback, null, null, customSaveMessage);

        if(!noRedirect){
            goToEdit ? this.edit(product) : this.list();
        }
    }

    addProductVariationToProduct(product: IProduct){

        this.router.navigate(['admin', 'inventory', 'products', 'view', product.id, 'variations', 'add']);

    }

    async canRemove(product: IProduct): Promise<boolean>{
        let canRemoveVariations = true;
        for(let variation of product.ProductVariations){
            if(!(await this.productVariationService.canRemove(variation))){
                canRemoveVariations = false;
                break;
            }
        }

        return canRemoveVariations;
    }

    remove(product: IProduct){
        this.socket.emitPromise('remove', product.id);
        this.router.navigate(['admin', 'inventory', 'products']);
    }

    /**
     *
     * @returns {Observable<Observable<IProduct>[]>}
     */
    getReportData(dateRange: Observable<DateRange>, searchQuery?: Observable<string>, loadingBarService?: SlimLoadingBarService): Observable<Observable<IProduct>[]> {

        return Observable.combineLatest(
                dateRange,
                searchQuery
            ).debounceTime(500).switchMap(([dateRange, searchQuery]) => {
                if (loadingBarService) {
                    loadingBarService.start();
                }

                return this.socket.emitPromise('sales-data', {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    searchQuery: searchQuery
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            });
    }

    /**
     *
     * @returns {Observable<Observable<IProduct>[]>}
     */
    getBestSellingData(dateRange: Observable<DateRange>): Observable<Observable<IProduct>[]> {

        return dateRange
            .switchMap(dateRange => {
                return this.socket.emitPromise('sales-data', {
                    mode: 'best-seller',
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            });
    }

    getBestSellingDataForDashboard(dateRange: Observable<DateRange>): Observable<any[]> {

        return dateRange
            .switchMap(dateRange => {
                return this.socket.emitPromise('sales-data', {
                    mode: 'best-seller',
                    limit: 5,
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

    exportProducts(args) {

        return this.socket.emitPromise('export', args)

    }
}
