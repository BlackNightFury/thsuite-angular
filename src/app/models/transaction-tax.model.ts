import {ITransactionTax} from "./interfaces/transaction-tax.interface";
export class TransactionTax implements ITransactionTax{

    id: string;
    version: number;

    transactionId: string;
    taxId: string;

    amount: number;

    constructor(obj?: ITransactionTax){
        Object.assign(this, obj);
    }

}
