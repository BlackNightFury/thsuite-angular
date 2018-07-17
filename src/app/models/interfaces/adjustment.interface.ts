import {ICommon} from "./common.interface";
import {IUser} from "./user.interface";
import {IAdjustmentLog} from "./adjustment-log.interface";

export interface IAdjustment extends ICommon {

    userId: string;
    User?: IUser;
    packageId: string;

    amount: number;
    reason: string;
    notes: string;

    date: Date;

    AdjustmentLog?: IAdjustmentLog;

    // Virtual field
    newQuantity?: string;
}