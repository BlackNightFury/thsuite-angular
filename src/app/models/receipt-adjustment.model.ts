import {IReceiptAdjustment} from "./interfaces/receipt-adjustment.interface";
import {IUser} from "./interfaces/user.interface";

export class ReceiptAdjustment implements IReceiptAdjustment{
    id: string;
    version: number;

    userId: string;
    User?: IUser;
    packageId: string;
    receiptId: string;

    amount: number;
    reason: string;
    notes: string;

    date: Date;


    constructor(obj: IReceiptAdjustment) {
        Object.assign(this, obj);
    }
}
