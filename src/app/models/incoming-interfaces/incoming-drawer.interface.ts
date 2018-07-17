import {ICommon} from "../interfaces/common.interface";
import {IDevice} from "../interfaces/device.interface";
import {IReceipt} from "../interfaces/receipt.interface";
import {IUser} from "../interfaces/user.interface";
import {IDrawerLog} from "../interfaces/drawer-log.interface";
import {IDrawerRemoval} from "../interfaces/drawer-removal.interface";

export interface IIncomingDrawer extends ICommon {

    deviceId: string;
    Device?: IDevice;

    Receipts?: IReceipt[];
    Log?: IDrawerLog[];

    userId: string;
    User?: IUser;

    DrawerRemovals?: IDrawerRemoval[];

    startingAmount: number;
    endingAmount: number;

    notesForCloser: string;

    createdAt: Date;
    closedAt: Date;

    closedByUserId: String;
    closedByUser?: IUser;
}
