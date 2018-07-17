import {IDeviceProxy} from "../models/interfaces/device-proxy.interface";
import {DeviceProxy} from "../models/device-proxy.model";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {Subject} from "rxjs/Subject";
import {Injectable, Injector} from "@angular/core";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {IUser} from "../models/interfaces/user.interface";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {IBarcode} from "../models/interfaces/barcode.interface";
import {ITimeClock} from "../models/interfaces/time-clock.interface";
import {IPackage} from "../models/interfaces/package.interface";
import {IStore} from "../models/interfaces/store.interface";

@Injectable()
export class DeviceProxyService extends CommonService<IDeviceProxy>{

    constructor(injector: Injector){
        super(injector, 'device-proxy');
    }

    newInstance(): IDeviceProxy{
        throw new Error("Device Proxy cannot be created on frontend");
    }

    dbInstance(fromDb: IDeviceProxy){
        return new DeviceProxy(fromDb);
    }

    instanceForSocket(object: IDeviceProxy) {
        return {
            id: object.id,
            version: object.version,

            name: object.name
        }
    }

    scaleEmitTo(scaleSource: Subject<any>){
        this.socket.on('scaleData', (data) => {
            scaleSource.next(data);
        })
    }

    doPrint(receipt: IReceipt, store: IStore, printerId: string, posDeviceId: string){
        //Organize data for backend
        //Need to send --
        //Receipt
        //Store Id
        //POS Device Id
        //Subtotal
        //Total
        let data = {
            receiptId: receipt.id,
            storeId: store.id,
            posDeviceId: posDeviceId,
            printerId: printerId,
            subtotal: receipt.subtotal,
            total: receipt.total,
            paid: receipt.amountPaid
        };
        this.socket.emitPromise('doPrint', data);
    }

    openDrawer() { this.socket.emitPromise('openDrawer', localStorage.getItem('receiptPrinterId') ) }

    printTransactionLabels(receipt: IReceipt, licenseNumber: string, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printTransactionLabels', {receipt, licenseNumber, printerId, posDeviceId});
    }

    printPatientLabels(receipt: IReceipt, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printPatientLabels', {receiptId: receipt.id, patientId: receipt.patientId, printerId, posDeviceId});
    }

    printPatientLabelsTest(printerId: string, posDeviceId: string){
        this.socket.emitPromise('printPatientLabelsTest', {printerId, posDeviceId});
    }

    printBarcodeLabels(barcodeId: string, productVariationId: string, packageId: string, type: string, amount: number, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printBarcodeLabels', {barcodeId, productVariationId, packageId, type, amount, printerId, posDeviceId});
    }

    printBulkFlowerLabels(receiptId: string, storeId: string, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printBulkFlowerLabels', {receiptId, storeId, printerId, posDeviceId});
    }

    printBulkFlowerBarcodeLabels(storeId: string, barcodeId: string, productVariationId: string, packageId: string, amount: number, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printBulkFlowerBarcodeLabels', {storeId, barcodeId, productVariationId, packageId, amount, printerId, posDeviceId});
    }

    printBulkFlowerLabelsTest(printerId: string, posDeviceId: string){
        this.socket.emitPromise('printBulkFlowerLabelsTest', {printerId, posDeviceId});
    }

    printTimeClockReport(timeClock: ITimeClock, userId: string, storeId: string, printerId: string, posDeviceId: string){
        this.socket.emitPromise('printTimeClockReport', {timeClock, userId, storeId, printerId, posDeviceId});
    }

    printDrawerClosingReport(userId: string, deviceId: string, selectedDate: string, printerId: string){
        this.socket.emitPromise('printCloseDrawerReport', {userId, deviceId, selectedDate, printerId});
    }

    printTest(type: string, printerId: string, posDeviceId: string){
        type = type.slice(0,1).toUpperCase() + type.slice(1);
        this.socket.emitPromise('printTest'+type, {printerId, posDeviceId});
    }

}
