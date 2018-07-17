import {ICommon} from "./common.interface";
import {IStore} from "./store.interface";
export interface IStoreOversaleLimit extends ICommon{
    storeId: string;
    Store?: IStore;

    cartMax: number;

    buds: number;
    shakeTrim: number;
    plants: number;
    infusedNonEdible: number;
    infusedEdible: number;
    concentrate: number;
}
