import {IIncomingReceipt} from "../incoming-interfaces/incoming-receipt.interface";

export interface IReceipt extends IIncomingReceipt {

    readonly subtotal: number;
    readonly discount: number;
    readonly tax: number;
    readonly total: number;
    readonly taxByType: any;
    readonly sentToMetrc: boolean;
}
