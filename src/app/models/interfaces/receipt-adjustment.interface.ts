import {ICommon} from "./common.interface";
import {IUser} from "./user.interface";

export interface IReceiptAdjustment extends ICommon {

    userId: string;
    User?: IUser;
    packageId: string;
    receiptId: string;

    amount: number;
    reason: string;
    notes: string;

    date: Date;

}
