import {ICommon} from "../interfaces/common.interface";
import {IDevice} from "../interfaces/device.interface";
import {IReceipt} from "../interfaces/receipt.interface";
import {IUser} from "../interfaces/user.interface";
import {IDrawerLog} from "../interfaces/drawer-log.interface";

export interface IIncomingDrawerRemoval extends ICommon {
    drawerId: string,

    userId: string,
    User?: IUser,

    removedAmount: number,
    createdAt: Date
}
