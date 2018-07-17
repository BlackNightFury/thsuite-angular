import {ICommon} from "./common.interface";
import {IUser} from "./user.interface";
import {IAdjustmentLog} from "./adjustment-log.interface";

export interface IPurchaseOrder extends ICommon {

    userId: string;
    User?: IUser;
    packageId: string;
    itemId: string;

    amount: number;
    price: number;
    notes: string;

    date: Date;

    // Virtual field
    newQuantity?: string;
}
