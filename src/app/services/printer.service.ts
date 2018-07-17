import {CommonService} from "./common.service";
import {SearchableService} from "./searchable.service";
import {SocketService} from "../lib/socket";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Router} from "@angular/router";
import {Mixin} from "../lib/decorators/class/mixin";
import {Injectable, Injector} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {DeviceProxyService} from "app/services/device-proxy.service";
import {IPrinter} from "../models/interfaces/printer.interface";
import {Printer} from "../models/printer.model";
import {IUser} from "../models/interfaces/user.interface";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {IStore} from "../models/interfaces/store.interface";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {IBarcode} from "../models/interfaces/barcode.interface";
import {ITimeClock} from "../models/interfaces/time-clock.interface";
import {IPackage} from "../models/interfaces/package.interface";

@Injectable()
@Mixin([SearchableService])
export class PrinterService extends CommonService<IPrinter> implements SearchableService<IPrinter>{

    private printerRegisteredSource = new Subject<any>();
    printerRegisteredEmitted = this.printerRegisteredSource.asObservable();

    constructor(injector: Injector, private deviceProxyService: DeviceProxyService){
        super(injector, 'printers');
    }

    all(): Observable<IPrinter[]>{

        let result = new Subject<Observable<IPrinter>[]>();

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                result.next(objects);
            });

        return result.asObservable().switchMap((printerObservables) => {
            if(printerObservables.length) {
                return Observable.combineLatest(printerObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    allEnabled(): Observable<IPrinter[]>{
        let result = new Subject<Observable<IPrinter>[]>();

        this.socket.emitPromise('allEnabled')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                result.next(objects);
            });

        return result.asObservable().switchMap((printerObservables) => {
            if(printerObservables.length) {
                return Observable.combineLatest(printerObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IPrinter>>;

    newInstance(): IPrinter{
        throw new Error("Printer object cannot be created on frontend");
    }

    dbInstance(fromDb: IPrinter){
        return new Printer(fromDb);
    }

    instanceForSocket(object: IPrinter) {
        return {
            id: object.id,
            version: object.version,

            deviceProxyId: object.deviceProxyId,
            port: object.port,
            name: object.name,
            isEnabled: object.isEnabled
        }
    }

    registered(){
        this.printerRegisteredSource.next(undefined);
    }

    openDrawer(){
        this.deviceProxyService.openDrawer();
    }

    printReceipt(receipt: IReceipt, store: IStore){
        let printerId = localStorage.getItem('receiptPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.doPrint(receipt, store, printerId, deviceId);
        }
    }

    printTransactionLabels(receipt: IReceipt, store: IStore){
        let printerId = localStorage.getItem('labelPrinterId');
        let licenseNumber = store.licenseNumber;
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printTransactionLabels(receipt, licenseNumber, printerId, deviceId);
        }
    }

    printPatientLabels(receipt: IReceipt, store: IStore){
        let printerId = localStorage.getItem('labelPrinterId');
        let licenseNumber = store.licenseNumber;
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printPatientLabels(receipt, printerId, deviceId);
        }
    }

    printPatientLabelsTest(){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printPatientLabelsTest(printerId, deviceId);
        }
    }

    printBarcodeLabels(barcode: IBarcode, productVariation: IProductVariation, _package: IPackage, type: string, amount: number){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printBarcodeLabels(barcode.id, productVariation.id, _package.id, type, amount, printerId, deviceId);
        }
    }

    printBulkFlowerLabels(receipt: IReceipt, store: IStore){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printBulkFlowerLabels(receipt.id, store.id, printerId, deviceId);
        }
    }

    printBulkFlowerBarcodeLabels(store: IStore, barcode: IBarcode, productVariation: IProductVariation, _package: IPackage, amount){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printBulkFlowerBarcodeLabels(store.id, barcode.id, productVariation.id, _package.id, amount, printerId, deviceId);
        }
    }

    printBulkFlowerLabelsTest(){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printBulkFlowerLabelsTest(printerId, deviceId);
        }
    }

    printTimeClockReport(timeClock: ITimeClock, user: IUser, store: IStore){
        let printerId = localStorage.getItem('receiptPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printTimeClockReport(timeClock, user.id, store.id, printerId, deviceId);
        }

    }

    printDrawerClosingReport(userId: string, deviceId: string, selectedDate: string){
        let printerId = localStorage.getItem('receiptPrinterId');
        if(!printerId){
            return;
        }else{
            this.deviceProxyService.printDrawerClosingReport(userId, deviceId, selectedDate, printerId);
        }
    }

    printTestReceipt(){
        let printerId = localStorage.getItem('receiptPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printTest('receipt', printerId, deviceId);
        }
    }

    printTestLabel(){
        let printerId = localStorage.getItem('labelPrinterId');
        if(!printerId){
            return;
        }else{
            let deviceId = localStorage.getItem('deviceId');
            this.deviceProxyService.printTest('label', printerId, deviceId);
        }
    }

}

