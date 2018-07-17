import {IIncomingLineItem} from "../incoming-interfaces/incoming-line-item.interface";

export interface ILineItem extends IIncomingLineItem {

    readonly fromBarcode: boolean;

    readonly subtotal: number;
    readonly discount: number;
    readonly tax: number;
    readonly total: number;
    readonly taxByType: any;
    readonly canReturn: boolean;
    readonly isReturn: boolean;
    readonly returnedQuantity: number;
    readonly wasReturned: boolean;
    readonly originalPurchaseQuantity: number;
    readonly originalPurchaseReturnedQuantity: number;
    readonly sentToMetrc: boolean;

    readonly wholesalePrice: number;
    readonly allTransactionsHavePackages: boolean;

    skipDiscountInPOSCart?: any[];
    fromSavedCart?: boolean;
}
