import {ICommon} from "./common.interface";
export interface ITransactionTax extends ICommon{

    transactionId: string;

    taxId: string;
    amount: number;

}
