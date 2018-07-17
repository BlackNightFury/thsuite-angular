import {Injector, Injectable} from "@angular/core";
import {ReplaySubject, Subject} from "rxjs";
import * as uuid from "uuid";
import {IBarcode} from "../models/interfaces/barcode.interface";
import {SearchableService} from "./searchable.service";
import {CommonService} from "./common.service";
import {ItemService} from "./item.service";
import {ProductVariationService} from "./product-variation.service";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {Barcode} from "../models/barcode.model";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Observable} from "rxjs/Observable";
import {SearchResult} from "../lib/search-result";
import {Mixin} from "../lib/decorators/class/mixin";
import {ObjectObservable} from "app/lib/object-observable";
import {PackageService} from "./package.service";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {IItem} from "../models/interfaces/item.interface";
import {IPackage} from "app/models/interfaces/package.interface";
import {BarcodeNavigationService} from "./barcode-navigation.service";

declare const $: any;

@Injectable()
@Mixin([SearchableService])
export class BarcodeService extends CommonService<IBarcode> implements SearchableService<IBarcode>, BarcodeNavigationService {

    private productVariationService: ProductVariationService

    constructor(private packageService: PackageService, private itemService: ItemService, injector: Injector) {
        super(injector, 'barcodes');

        setTimeout(() => {
            this.productVariationService = injector.get<ProductVariationService>(ProductVariationService);
        })
        console.log("Initialized barcode listener");

        let string = '';

        let timeoutId = undefined;
        $(document).on('keypress', (e) => {

            if($(e.target).is('input:not(.scan-barcode),textarea')) {
                return;
            }

            if(e.which == 13) {
                this.scanSource.next(string);
            }
            else {
                string += String.fromCharCode(e.which);
            }

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                string = '';
            }, 200);

            return;
        })
    }

    private scanSource = new Subject<string>();
    scanEmitted = this.scanSource.asObservable();
    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IBarcode>>;

    getByProductVariationId(productVariationId: string): Observable<IBarcode[]>{

        const subject = new Subject<IBarcode[]>();

        this.socket.emitPromise('getByProductVariationId', productVariationId)
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable();
    }

    getAllBarcodesMap(): Observable<IBarcode[]>{

        const subject = new Subject<IBarcode[]>();

        this.socket.emitPromise('getAllBarcodesMap')
            .then(barcodes => {
                if (barcodes && barcodes.length) {
                    subject.next(barcodes);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable();
    }

    getByBarcodeString(barcode: string): Observable<ObjectObservable<IBarcode>>{

        const result = new Subject<ObjectObservable<IBarcode>>();

        this.socket.emitPromise('getByBarcodeString', barcode)
            .then(barcodeId => {
                if(barcodeId){
                    result.next(this.getAssociated(barcodeId));
                }else{
                    result.next(undefined);
                }
            });

        return result.asObservable();
    }

    getByPackageId(packageId: string): Observable<IBarcode[]>{

        const subject = new Subject<IBarcode[]>();

        this.socket.emitPromise('getByPackageId', packageId)
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.get(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            }).catch( e => {
                console.log("********", e);
                return subject.asObservable();
            });

        return subject.asObservable();
    }

    newInstance(){
        return new Barcode({
            id: uuid.v4(),
            version: 0,

            barcode: '',
            productVariationId: '',
            allocatedInventory: null,
            remainingInventory: null,
            createdAt: ''
        });
    }

    dbInstance(fromDb: IBarcode){
        return new Barcode(fromDb);
    }

    instanceForSocket(object: IBarcode) {
        return {
            id: object.id,
            version: object.version,

            barcode: object.barcode,
            productVariationId: object.productVariationId,
            allocatedInventory: object.allocatedInventory,
            remainingInventory: object.remainingInventory,
            createdAt: object.createdAt,
            ItemPackages: object.ItemPackages
        }
    }

    resolveAssociations(barcode: IBarcode, scopes: Array<string> = ['productVariation', 'items', 'packages']): ObjectObservable<IBarcode> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'productVariation': {
                // Key in parent Object => resolver function that must return observable
                'ProductVariation': () => {
                    if (barcode && barcode.ProductVariation) {
                        return this.productVariationService.getAssociated(barcode.ProductVariation.id);
                    } else if ( barcode && barcode.productVariationId){
                        return this.productVariationService.getAssociated(barcode.productVariationId);
                    }

                    return Observable.of(undefined);
                }
            },
            'items': {
                'Items': () => {
                    if(barcode){
                        return this.itemService.getByBarcodeId(barcode.id)
                    }

                    return Observable.of(undefined);
                }
            },
            'packages': {
                'Packages': () => {
                    if(barcode){
                        return this.packageService.getByBarcodeId(barcode.id)
                    }

                    return Observable.of(undefined);
                }
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(barcode), barcode.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);

                return Observable.combineLatest(
                    vars['items'] ? Observable.combineLatest(vars['items']) : Observable.of([]),
                    vars['packages'] ? Observable.combineLatest(vars['packages']) : Observable.of([]),
                    (items, packages) => {
                        vars['items'] = items;
                        vars['packages'] = packages;

                        return this.mapAssociationsObject(barcode, vars, resolversToResolve);
                });
            });

        return new ObjectObservable(obs, barcode ? barcode.id : null);
    }

    resolveAssociationsLegacy(barcode: IBarcode): ObjectObservable<IBarcode> {

        let productVariationObservable: ObjectObservable<IProductVariation>;
        let itemsObservable: Observable<ObjectObservable<IItem>[]>;
        let packagesObservable: Observable<ObjectObservable<IPackage>[]>;

        if(barcode.ProductVariation) {
            productVariationObservable = this.productVariationService.getAssociated(barcode.ProductVariation.id);
        }else if(barcode.productVariationId){
            productVariationObservable = this.productVariationService.getAssociated(barcode.productVariationId);
        }

        itemsObservable = this.itemService.getByBarcodeId(barcode.id);
        packagesObservable = this.packageService.getByBarcodeId(barcode.id);

        let obs = Observable.combineLatest(
            productVariationObservable,
            itemsObservable,
            packagesObservable
        ).switchMap(([productVariation, itemsObservables, packagesObservables]) => {

            return Observable.combineLatest(
                itemsObservables.length ? Observable.combineLatest(itemsObservables) : Observable.of([]),
                packagesObservables.length ? Observable.combineLatest(packagesObservables) : Observable.of([]),
                (items, packages) => {
                    barcode.ProductVariation = productVariation;
                    barcode.Items = items;
                    barcode.Packages = packages;

                    return barcode;
                }
            )
        });

        return new ObjectObservable(obs, barcode.id);
    }

    create(productVariationId?: string, productId?: string, productTypeId?: string) {
        let queryString = '';

        if (productVariationId && productId && productTypeId) {
            queryString = `?productTypeId=${productTypeId}&productId=${productId}&productVariationId=${productVariationId}`;
        }

        this.router.navigateByUrl("/admin/inventory/barcodes/add" + queryString);
    }

    createFromProductVariation(productVariation: IProductVariation, _package?: IPackage){

        let productTypeId = productVariation.Product.productTypeId;
        let productId = productVariation.Product.id;
        let productVariationId = productVariation.id;

        let queryString = `?productTypeId=${productTypeId}&productId=${productId}&productVariationId=${productVariationId}`;

        if(_package){
            queryString += `&packageId=${_package.id}`;
        }

        let url = "/admin/inventory/barcodes/add" + queryString;

        this.router.navigateByUrl(url);
    }

    list(){
        this.router.navigate(['admin', 'inventory', 'barcodes']);
    }

    view(barcode: IBarcode, packageId? : string){
        this.router.navigate(['admin', 'inventory', 'barcodes', 'view', barcode.id]);
    }

    edit(barcode: IBarcode, packageId? : string){
        this.router.navigate(['admin', 'inventory', 'barcodes', 'edit', barcode.id]);
    }

    save(barcode: IBarcode, cb){
        super.save(barcode, cb);
    }

    remove(barcode: IBarcode){
        this.socket.emitPromise('remove', barcode.id);
    }

    generateBarcode(): Promise<string>{

        return this.socket.emitPromise('generateBarcode');
    }

    checkDuplicate(barcode: string): Promise<boolean>{

        return this.socket.emitPromise('checkDuplicate', barcode);
    }

    printBarcodes(barcode: string, numToPrint: number): Promise<string>{

        return this.socket.emitPromise('generatePDF', {barcode: barcode, numToPrint: numToPrint});
    }

    allocateInventory(barcode: IBarcode, packageId? : string){

        this.router.navigate(['admin', 'inventory', 'barcodes', 'view', barcode.id, 'allocate', 'add']);
    }

    viewAllocation(barcode: IBarcode, packageId? : string){

        this.router.navigate(['admin', 'inventory', 'barcodes', 'view', barcode.id, 'allocate', 'view']);
    }

    scaleAllocation(barcode: IBarcode, packageId? : string){
        this.router.navigate(['admin', 'inventory', 'barcodes', 'view', barcode.id, 'allocate', 'scale']);
    }
}
