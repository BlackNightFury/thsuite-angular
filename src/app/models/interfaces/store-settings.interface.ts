import {ICommon} from "./common.interface";
import {IStore} from "./store.interface";

export interface IStoreSettings extends ICommon {

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
    drawerAmountForAlert: number;
}
