import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ICommon} from "../models/interfaces/common.interface";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ObjectObservable} from "../lib/object-observable";
import {SearchResult} from "../lib/search-result";
import {PackageService} from "./package.service";
import {SupplierService} from "./supplier.service";
import {Router} from "@angular/router";
import {IItem} from "../models/interfaces/item.interface";
import {Item} from "../models/item.model";
import {IPackage} from "../models/interfaces/package.interface";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {StoreService} from "./store.service";
import {IProductVariationItem, isIProductVariationItem} from "../models/interfaces/product-variation-item.interface";


@Injectable()
@Mixin([SearchableService])
export class ItemService extends CommonService<IItem> implements SearchableService<IItem> {

    private packageService: PackageService;

    constructor(
        private productTypeService: ProductTypeService,
        private supplierService: SupplierService,
        injector: Injector,
        private storeService: StoreService
    ) {
        super(injector, 'items');

        setTimeout(() => {
            this.packageService = injector.get<PackageService>(PackageService)
        })
    }

    search: (query: string, page: number) => Observable<SearchResult<IItem>>;

    getByBarcodeId(barcodeId: string): Observable<ObjectObservable<IItem>[]>{

        let results = new Subject<ObjectObservable<IItem>[]>();

        this.socket.emitPromise('getByBarcodeId', barcodeId)
            .then(itemIds => {
                results.next(itemIds.map(id => this.get(id)));
            });

        return results.asObservable()

    }

    newInstance() {
        return new Item({
            id: uuid.v4(),
            version: 0,

            clientId: '',
            storeId: '',

            name: '',
            MetrcId: 0,

            UnitOfMeasureName: 'Each',
            UnitOfMeasureAbbreviation: 'ea',

            productTypeId: '',

            Packages: [],

            supplierId: '',
            thcWeight: 0
        });
    }
    dbInstance(fromDb: IItem) {
        return new Item(fromDb);
    }

    instanceForSocket(object: IProductVariationItem): IProductVariationItem;
    instanceForSocket(object: IItem): IItem;
    instanceForSocket(object: IItem | IProductVariationItem): IItem | IProductVariationItem {
        let obj = {
            id: object.id,
            version: object.version,

            clientId: object.clientId,
            storeId: object.storeId,

            name: object.name,
            MetrcId: object.MetrcId,

            UnitOfMeasureName: object.UnitOfMeasureName,
            UnitOfMeasureAbbreviation: object.UnitOfMeasureAbbreviation,

            productTypeId: object.productTypeId,

            supplierId: object.supplierId,
            thcWeight: object.thcWeight,

            initialPackageQuantity: object.initialPackageQuantity
        }


        //All of this is bad -- but it will WORK
        //This is here because sometimes product variations are saved with an array of items, but they are actually IProductVariationItems
        //This is to get around typescript complaining

        if(isIProductVariationItem(object)){
            (<IProductVariationItem>obj).ProductVariationItem = {
                productVariationId: object.ProductVariationItem.productVariationId,
                quantity: object.ProductVariationItem.quantity
            };

            return (<IProductVariationItem>obj);
        }

        return obj;
    }

    resolveAssociations(item: IItem, scopes: Array<string> = ['productType', 'packages', 'supplier', 'store']): ObjectObservable<IItem> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'productType': {
                // Key in parent Object => resolver function that must return observable
                'ProductType': () => this.productTypeService.get(item.productTypeId)
            },
            'packages': {
                'Packages': () => this.packageService.getByItemId(item.id)
            },
            'supplier': {
                'Supplier': () => item.supplierId ? this.supplierService.get(item.supplierId) : Observable.of(undefined)
            },
            'store': {
                'Store': () => item.storeId ? this.storeService.get(item.storeId) : Observable.of(undefined)
            },
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(item), item.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);

                if (!vars['packages'] || !vars['packages'].length) {
                    return Observable.of(this.mapAssociationsObject(item, vars, resolversToResolve));
                } else {
                    return Observable.combineLatest(vars['packages'], (...packages: IPackage[]) => {
                        vars['packages'] = packages;
                        return this.mapAssociationsObject(item, vars, resolversToResolve);
                    });
                }
            });

        return new ObjectObservable(obs, item.id);
    }

    // Legacy resolveAssociations way
    resolveAssociationsLegacy(item: IItem): ObjectObservable<IItem> {
        let obs = Observable.combineLatest(
            this.productTypeService.get(item.productTypeId),
            this.packageService.getByItemId(item.id),
            item.supplierId ? this.supplierService.get(item.supplierId) : Observable.of(undefined),
            item.storeId ? this.storeService.get(item.storeId) : Observable.of(undefined) //storeId should always be set (or maybe it should just be clientId)
        ).switchMap(([productType, packageObservables, supplier,store]) => {

            if(!packageObservables.length) {
                item.ProductType = productType;
                item.Packages = [];
                item.Supplier = supplier;
                item.Store = store;
                return Observable.of(item);
            }

            return Observable.combineLatest(packageObservables, (...packages: IPackage[]) => {

                item.ProductType = productType;
                item.Packages = packages;
                item.Supplier = supplier;
                item.Store = store;

                return item;
            })
        });

        return new ObjectObservable(obs, item.id);
    }

    saveThcWeight(itemId: string, thcWeight: number, callback?: any) {
        return this.socket.emitPromise('saveThcWeight', {itemId, thcWeight}).then(()=>{
            if (callback) {
                callback();
            }
        })
    }

    create() {
        this.router.navigate(['admin', 'inventory', 'items', 'add']);
    }

    edit(item: IItem) {
        this.router.navigate(['admin', 'inventory', 'items', 'edit', item.id])
    }

    exportItems(args: any) {
        return this.socket.emitPromise('export', args);
    }

    view(item: IItem) {
        this.router.navigate(['admin', 'inventory', 'items', 'view', item.id])
    }

    list() {
        this.router.navigate(['admin', 'inventory', 'items']);
    }

    cancelEdit(item: IItem) {
        this.router.navigateByUrl('/admin/inventory/items');
    }

    save(item: IItem, callback?, skipNotification?) {
        super.save(item, callback, skipNotification);

        // this.router.navigateByUrl('/admin/inventory/items');
    }

    remove(item: IItem){
        this.socket.emitPromise('remove', item.id);

        this.router.navigateByUrl('/admin/inventory/items');
    }

}
