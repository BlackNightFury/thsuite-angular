import {Injectable, Injector} from "@angular/core";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {SearchResult} from "../lib/search-result";
import {IPackage} from "../models/interfaces/package.interface";
import {Package} from "../models/package.model";
import {Router} from "@angular/router";
import {ItemService} from "./item.service";
import {SearchableService} from "./searchable.service";
import {IItem} from "../models/interfaces/item.interface";
import {Mixin} from "../lib/decorators/class/mixin";
import {AdjustmentService} from "./adjustment.service";
import {IAdjustment} from "../models/interfaces/adjustment.interface";
import {PurchaseOrderService} from "./purchase-order.service";
import {IPurchaseOrder} from "../models/interfaces/purchase-order.interface";
import {PackagePriceAdjustmentService} from "./package-price-adjustment.service";
import {IPackagePriceAdjustment} from "../models/interfaces/package-price-adjustment.interface";
import {SupplierService} from "./supplier.service";
import {DeliveryPackageService} from "./delivery-package.service";
import {ISupplier} from "../models/interfaces/supplier.interface";
import {DateRange} from "../lib/date-range";
import {LabTestResultService} from "./lab-test-result.service";

@Injectable()
@Mixin([SearchableService])
export class PackageService extends CommonService<IPackage> implements SearchableService<IPackage> {

    private lowInventoryPackageEmittedSource = new BehaviorSubject<Package>(undefined);
    lowInventoryPackageEmitted = this.lowInventoryPackageEmittedSource.asObservable();

    search: (query: string, page: number) => Observable<SearchResult<IPackage>>;

    protected emitUploadIdsModalShowingSource = new BehaviorSubject<boolean>(undefined);
    uploadIdsModalShowing = this.emitUploadIdsModalShowingSource.asObservable();

    constructor(
        injector: Injector,
        private itemService: ItemService,
        private adjustmentService: AdjustmentService,
        private purchaseOrderService: PurchaseOrderService,
        private packagePriceAdjustmentService: PackagePriceAdjustmentService,
        private supplierService: SupplierService,
        private deliveryPackageService: DeliveryPackageService,
        private labTestResultService: LabTestResultService
    ) {
        super(injector, 'packages');

        this.socket.on('lowInventoryPackage', (_package) => {
            if (_package) {
                this.lowInventoryPackageEmittedSource.next(_package);
            }
        });
    }

    exportPackages(args) {
        return this.socket.emitPromise('export', Object.assign({export: true}, args));
    }

    exportPackageReport(args) {
        return this.socket.emitPromise('export-packages', Object.assign({export: true}, args))
            .then(response => {
                return response.Location;
            }).catch(err => {
            console.log('Error exporting packages: ');
            console.log(err);
        });
    }

    checkLowInventoryPackage(itemIds?: string[]) {
        this.socket.emitPromise('getLowInventoryPackage', itemIds)
            .then(_package => {
                if (_package) {
                    this.lowInventoryPackageEmittedSource.next(_package);
                } else {
                    this.lowInventoryPackageEmittedSource.next(null);
                }
            });
    }

    getByTag(tag: string): Promise<ObjectObservable<IPackage>> {

        return new Promise(resolve => {
            this.socket.emitPromise('getByTag', tag)
                .then(packageId => {
                    resolve(this.getAssociated(packageId));
                });
        })

    }

    getByItemId(itemId: string): Observable<ObjectObservable<IPackage>[]> {

        let results = new Subject<ObjectObservable<IPackage>[]>();

        this.socket.emitPromise('getByItemId', itemId)
            .then(packageIds => {
                results.next(packageIds.map(id => this.get(id)));
            });

        return results.asObservable()
    }

    getByBarcodeId(barcodeId: string): Observable<ObjectObservable<IPackage>[]>{

        let results = new Subject<ObjectObservable<IPackage>[]>();

        this.socket.emitPromise('getByBarcodeId', barcodeId)
            .then(packageIds => {
                results.next(packageIds.map(id => this.get(id)));
            });

        return results.asObservable()

    }

    getByReceiptBarcode(barcode: string): Promise<ObjectObservable<IPackage>> {

        return new Promise(resolve => {
            this.socket.emitPromise('getByReceiptBarcode', barcode)
                .then(packageId => {
                    resolve(this.get(packageId));
                });
        })

    }

    getPackageAudit(packageId: string) {
        return this.socket.emitPromise('package-audit', {packageId});
    }

    getBarcodeIds(packageId: string): Observable<string[]> {
        let results = new Subject<string[]>();
        this.socket.emitPromise('get-barcode-ids', {packageId})
            .then(barcodeIds => {
                results.next(barcodeIds);
            });

        return results.asObservable();
    }

    getHasPrice(packageId: string): Observable<boolean> {
        let results = new Subject<boolean>();
        this.socket.emitPromise('get-has-price', {packageId})
            .then(hasPrice => {
                results.next(hasPrice);
            });

        return results.asObservable();
    }

    newInstance() {
        return new Package({
            id: uuid.v4(),
            version: 0,
            itemId: '',
            wholesalePrice: 0,
            availableQuantity: 0,
            Label: '',
            MetrcId: 0,
            Quantity: 0,
            ReceivedQuantity: 0,
            UnitOfMeasureName: '',
            UnitOfMeasureAbbreviation: '',
            FinishedDate: null,
            ReceivedDateTime: null,
            ManifestNumber: '',
            thcPercent: 0,
            cbdPercent: 0,
            strainType: '',
            ingredients: '',
            supplierId: ''
        });
    }

    dbInstance(fromDb: IPackage) {
        return new Package(fromDb);
    }

    instanceForSocket(object: IPackage) {
        return {
            id: object.id,
            version: object.version,

            itemId: object.itemId,
            wholesalePrice: object.wholesalePrice,
            availableQuantity: object.availableQuantity,
            Label: object.Label,
            MetrcId: object.MetrcId,
            Quantity: object.Quantity,
            ReceivedQuantity: object.ReceivedQuantity,
            UnitOfMeasureName: object.UnitOfMeasureName,
            UnitOfMeasureAbbreviation: object.UnitOfMeasureAbbreviation,
            FinishedDate: object.FinishedDate,
            thcPercent: object.thcPercent,
            cbdPercent: object.cbdPercent,
            strainType: object.strainType,
            ingredients: object.ingredients,
            supplierId: object.supplierId,
            ReceivedDateTime: object.ReceivedDateTime,
            ManifestNumber: object.ManifestNumber
        }
    }

    resolveAssociations(metrcPackage: IPackage, scopes: Array<string> = ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments', 'deliveryPackage', 'labTestResult']): ObjectObservable<IPackage> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'item': {
                // Key in parent Object => resolver function that must return observable
                'Item': () => this.itemService.getAssociated(metrcPackage.itemId)
            },
            'supplier': {
                'Supplier': () => metrcPackage.supplierId ? this.supplierService.get(metrcPackage.supplierId) : Observable.of(undefined)
            },
            'adjustments': {
                'Adjustments': () => this.adjustmentService.getByPackageId(metrcPackage.id)
            },
            'purchaseOrders': {
                'PurchaseOrders': () => this.purchaseOrderService.getByPackageId(metrcPackage.id)
            },
            'priceAdjustments': {
                'PriceAdjustments': () => this.packagePriceAdjustmentService.getByPackageId(metrcPackage.id)
            },
            'deliveryPackage': {
                'DeliveryPackage': () => this.deliveryPackageService.getByPackageId(metrcPackage.id, metrcPackage.Label)
            },
            'labTestResult': {
                'LabTestResult': () => this.labTestResultService.getByPackageId(metrcPackage.id)
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(metrcPackage), metrcPackage.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);

                return Observable.combineLatest(
                    vars['adjustments'] && vars['adjustments'].length ? Observable.combineLatest(vars['adjustments']) : Observable.of([]),
                    vars['purchaseOrders'] && vars['purchaseOrders'].length ? Observable.combineLatest(vars['purchaseOrders']) : Observable.of([]),
                    vars['priceAdjustments'] && vars['priceAdjustments'].length ? Observable.combineLatest(vars['priceAdjustments']) : Observable.of([]),
                    (adjustments, purchaseOrders, priceAdjustments) => {
                        vars['adjustments'] = adjustments;
                        vars['purchaseOrders'] = purchaseOrders;
                        vars['priceAdjustments'] = priceAdjustments;

                        if (!vars['deliveryPackage']) {
                            delete vars['deliveryPackage'];
                        }

                        return this.mapAssociationsObject(metrcPackage, vars, resolversToResolve);
                    }
                );
            });

        return new ObjectObservable(obs, metrcPackage.id);
    }

    resolveAssociationsLegacy(metrcPackage: IPackage): ObjectObservable<IPackage> {
        let obs = Observable.combineLatest(
            this.itemService.getAssociated(metrcPackage.itemId),
            this.adjustmentService.getByPackageId(metrcPackage.id),
            this.packagePriceAdjustmentService.getByPackageId(metrcPackage.id),
            this.supplierService.get(metrcPackage.supplierId),
            this.deliveryPackageService.getByPackageId(metrcPackage.id, metrcPackage.Label),
            // this.getBarcodeIds(metrcPackage.id),
            // this.getHasPrice(metrcPackage.id),
        ).switchMap(([item, adjustmentObservables, priceAdjustmentObservables, supplier, deliveryPackage]) => {

            return Observable.combineLatest(
                adjustmentObservables.length ? Observable.combineLatest(adjustmentObservables) : Observable.of([]),
                priceAdjustmentObservables.length ? Observable.combineLatest(priceAdjustmentObservables) : Observable.of([]),
                (adjustments, purchaseOrder, priceAdjustments) => {


                    metrcPackage.Item = item;
                    metrcPackage.Supplier = supplier;
                    metrcPackage.Adjustments = adjustments;
                    metrcPackage.PriceAdjustments = priceAdjustments;
                    // metrcPackage.barcodeIds = barcodeIds;
                    // metrcPackage.hasPrices = hasPrice;
                    if( deliveryPackage ) metrcPackage.DeliveryPackage = deliveryPackage

                    return metrcPackage;
                }
            );

            // if(!adjustmentObservables.length && !priceAdjustmentObservables.length) {
            //     metrcPackage.Item = item;
            //     metrcPackage.Adjustments = [];
            //     metrcPackage.PriceAdjustments = [];
            //     return Observable.of(metrcPackage);
            // }else if(adjustmentObservables.length && !priceAdjustmentObservables.length){
            //     return Observable.combineLatest(adjustmentObservables, (...adjustments: IAdjustment[]) => {
            //
            //         metrcPackage.Item = item;
            //         metrcPackage.Adjustments = adjustments;
            //         metrcPackage.PriceAdjustments = [];
            //
            //         return metrcPackage;
            //
            //     })
            // } else if(!adjustmentObservables.length && priceAdjustmentObservables.length){
            //     return Observable.combineLatest(priceAdjustmentObservables, (...adjustments: IPackagePriceAdjustment[]) => {
            //
            //         metrcPackage.Item = item;
            //         metrcPackage.Adjustments = [];
            //         metrcPackage.PriceAdjustments = adjustments;
            //
            //         return metrcPackage;
            //
            //     })
            // }else{
            //     //Both have length
            //     return Observable.combineLatest(
            //         adjustmentObservables,
            //         priceAdjustmentObservables
            //     ).switchMap(([adjustments, priceAdjustments]) => {
            //
            //     })
            // }



        });


        return new ObjectObservable(obs, metrcPackage.id);

    }

    save(pckg: IPackage, ackCallback?: any, skipNotification?) {
        super.save(pckg, ackCallback, skipNotification);
    }

    convertToAnotherPackage({packages, outDate, outItemId, outPackageLabeId, outSupplierId}) {
        return this.socket.emitPromise('convert-package', {packages, outDate, outItemId, outPackageLabeId, outSupplierId})
            .then(response => response);
    }

    protected upsertObject(fromServer: boolean, newObject: IPackage, ackCallback?: any): Observable<IPackage> {

        let [subject, created] = this.getSubject(newObject.id);

        subject.next(this.dbInstance(newObject));

        let packageWithoutItem = new Package(newObject);
        packageWithoutItem.Item = undefined;

        if (!fromServer) {
            this.socket.emitPromise('update', packageWithoutItem)
                .then(() => {
                    this.refresh(newObject);
                    if(ackCallback) {
                        ackCallback(null, newObject)
                    }
                })
                .catch(err => {
                    if(ackCallback) {
                        ackCallback(err)
                    }
                });

            newObject.version++;
        }

        return subject.asObservable();
    }

    refresh(_package: IPackage){
        super.refresh(_package);
        this.itemService.refreshAssociations(_package.itemId);
    }

    showUploadIdsModal(){
        this.emitUploadIdsModalShowingSource.next(true);
    }

    hideUploadIdsModal(){
        this.emitUploadIdsModalShowingSource.next(false);
    }

    edit(item: IItem, _package: IPackage) {
        this.router.navigate(['admin', 'inventory', 'items', 'edit', item.id, 'packages', 'edit', _package.id])
    }

    list(item: IItem) {
        this.router.navigate(['admin', 'inventory', 'items', 'edit', item.id, 'packages'])
    }

    dashboard(){
        this.router.navigate(['admin', 'inventory', 'packages', 'dashboard']);
    }

    detailView(_package: IPackage, mode?: string){

        if(!mode) {
            mode = "details";
        }

        this.router.navigate(['admin', 'inventory', 'packages', 'details', _package.id, mode]);
    }

    detailViewById(packageId:string){
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId]);
    }

    createConvertView(_package: IPackage){
        this.router.navigate(['admin', 'inventory', 'packages', 'create-convert', _package.id]);
    }

    inventoryReport(dates: Object): Observable<Observable<Array<any>[]>>{
        let data = new Subject<Observable<Array<any>[]>>();
        this.socket.emitPromise('inventory-report', dates)
            .then(response => {
                data.next(response);
            })
            .catch(err => {
            console.log('err: ');
            console.log(err);
        });

        return data.asObservable();
    }

    inventoryBreakdownReport(args: any): Observable<Observable<Array<any>[]>>{
        let data = new Subject<Observable<Array<any>[]>>();
        this.socket.emitPromise('inventory-breakdown-report', args)
            .then(response => {
                data.next(response);
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });

        return data.asObservable();
    }

    downloadReport(report){
        return this.socket.emitPromise('download-report', report)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }

    addQuantity(packageId: string, amount: number){
        return this.socket.emitPromise('add-quantity', { packageId, amount })
    }

    getUploadParams(): Promise<any> {
        return this.socket.emitPromise('get-s3-upload-params');
    }
}
