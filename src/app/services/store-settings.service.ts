import {Injectable, Injector} from "@angular/core";

import * as uuid from "uuid";

import {IStoreSettings} from "../models/interfaces/store-settings.interface";
import {StoreSettings} from "../models/store-settings.model";

import "rxjs/add/operator/toPromise";
import {CommonService} from "./common.service";
import {ObjectObservable} from "../lib/object-observable";
import {Observable, Subject} from "rxjs";
import {Router} from "@angular/router";
import {SocketService} from "../lib/socket";


@Injectable()
export class StoreSettingsService extends CommonService<IStoreSettings> {

    constructor(injector: Injector) {
        super(injector, 'store-settings');
    }

    dbInstance(fromDb: IStoreSettings) {
        return new StoreSettings(fromDb);
    }

    newInstance(): IStoreSettings {
        throw new Error("StoreSettings object cannot be created on frontend");
    }

    instanceForSocket(object: IStoreSettings) : IStoreSettings{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,

            cashManagement              : object.cashManagement,
            customerQueue               : object.customerQueue,
            requireCustomerInformation  : object.requireCustomerInformation,
            verifyCustomerAge           : object.verifyCustomerAge,
            belowCostWarning            : object.belowCostWarning,
            autoPrintReceipts           : object.autoPrintReceipts,
            combinePricingTiers         : object.combinePricingTiers,
            signOutAfterSale            : object.signOutAfterSale,
            signOutAfterInactivity      : object.signOutAfterInactivity,
            autoCloseLots               : object.autoCloseLots,
            autoCloseLotsEmails         : object.autoCloseLotsEmails,
            enableMedicalTransactions   : object.enableMedicalTransactions,
            lowBarcodeThreshold         : object.lowBarcodeThreshold,
            lowInventoryGramThreshold   : object.lowInventoryGramThreshold,
            lowInventoryEachThreshold   : object.lowInventoryEachThreshold,
            alertOnLowBarcode           : object.alertOnLowBarcode,
            alertOnLowInventory         : object.alertOnLowInventory,
            lowBarcodeEmailList         : object.lowBarcodeEmailList,
            lowInventoryEmailList       : object.lowInventoryEmailList,
            dailySalesEmailList         : object.dailySalesEmailList,
            enableDrawerLimit           : object.enableDrawerLimit,
            drawerAmountForAlert        : object.drawerAmountForAlert
        }
    }

    getByStoreId(storeId: string): Observable<IStoreSettings> {

        let storeSettingsSubject = new Subject<IStoreSettings>();

        this.socket.emitPromise('getByStoreId', storeId)
            .then(storeSettingsId => {
                this.get(storeSettingsId)
                    .subscribe(storeSettingsSubject);
            });

        return storeSettingsSubject.asObservable();
    }
}
