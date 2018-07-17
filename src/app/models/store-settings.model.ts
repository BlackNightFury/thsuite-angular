import {IStore} from "./interfaces/store.interface";
import {IStoreSettings} from "./interfaces/store-settings.interface";

export class StoreSettings implements IStoreSettings {
    id: string;
    version: number;

    storeId: string;
    Store?: IStore;

    cashManagement: string;
    customerQueue: boolean;
    requireCustomerInformation: boolean;
    verifyCustomerAge: boolean;
    belowCostWarning: boolean;
    autoPrintReceipts: boolean;
    combinePricingTiers: boolean;
    signOutAfterSale: boolean;
    signOutAfterInactivity: string;
    autoCloseLots: boolean;
    autoCloseLotsEmails: boolean;
    enableMedicalTransactions: boolean;
    lowBarcodeThreshold: number;
	lowInventoryGramThreshold: number;
	lowInventoryEachThreshold: number;
	alertOnLowBarcode: boolean;
	alertOnLowInventory: boolean;
	lowBarcodeEmailList: string;
	lowInventoryEmailList: string;
    dailySalesEmailList: string;
    enableDrawerLimit: boolean;
    drawerAmountForAlert: number = -1;

    constructor(obj: IStoreSettings) {
        Object.assign(this, obj);
    }
}
