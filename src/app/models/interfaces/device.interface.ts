import {ICommon} from "./common.interface";
import {IDrawer} from "./drawer.interface";
import {IStore} from "./store.interface";

export interface IDevice extends ICommon {

    storeId: string;
    Store?: IStore;
    
    CurrentDrawer?: IDrawer;

    name: string;
}
