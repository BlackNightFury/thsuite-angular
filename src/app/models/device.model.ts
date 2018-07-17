import {IDevice} from "./interfaces/device.interface";
import {IDrawer} from "./interfaces/drawer.interface";
import {IStore} from "./interfaces/store.interface";

export class Device implements IDevice {
    id: string;
    version: number;

    storeId: string;
    Store?: IStore;

    CurrentDrawer?: IDrawer;

    name: string;

    constructor(obj: IDevice) {
        Object.assign(this, obj);
    }
}
