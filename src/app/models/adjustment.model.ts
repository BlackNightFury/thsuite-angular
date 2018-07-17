import {IAdjustment} from "./interfaces/adjustment.interface";
import {IAdjustmentLog} from "./interfaces/adjustment-log.interface";
import {IUser} from "./interfaces/user.interface";

export class Adjustment implements IAdjustment{
    id: string;
    version: number;

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

    constructor(obj: IAdjustment) {
        Object.assign(this, obj);
    }
}
