import {ICommon} from "./common.interface";
import {IUser} from "./user.interface";

export interface IPackagePriceAdjustment extends ICommon {

    userId: string;
    User?: IUser;
    packageId: string;

    amount: number;
    reason: string;
    notes: string;

    date: Date;

    adjustedAmount?: number;
}