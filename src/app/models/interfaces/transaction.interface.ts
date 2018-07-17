import {IIncomingTransaction} from "../incoming-interfaces/incoming-transaction.interface";

export interface ITransaction extends IIncomingTransaction {

    packageSelect2Options?: Select2Options;

    readonly subtotal: number;
    readonly tax: number;
    readonly taxByType: any;

}
