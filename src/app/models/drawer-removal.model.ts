import {IDevice} from "./interfaces/device.interface";
import {IDrawer} from "./interfaces/drawer.interface";
import {IReceipt} from "./interfaces/receipt.interface";
import {IUser} from "./interfaces/user.interface";
import {IDrawerLog} from "./interfaces/drawer-log.interface";
import {IIncomingDrawer} from "./incoming-interfaces/incoming-drawer.interface";
import * as moment from "moment"
import {IIncomingDrawerRemoval} from "./incoming-interfaces/incoming-drawer-removal.interface";
import {IDrawerRemoval} from "./interfaces/drawer-removal.interface";

export class DrawerRemoval implements IDrawerRemoval {
    id: string;
    version: number;

    drawerId: string;

    userId: string;
    User?: IUser;

    removedAmount: number;
    createdAt: Date;

    constructor(obj: IIncomingDrawerRemoval) {
        Object.assign(this, obj);
    }
}
