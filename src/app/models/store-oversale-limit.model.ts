import {IStoreOversaleLimit} from "./interfaces/store-oversale-limit.interface";
import {IStore} from "./interfaces/store.interface";
export class StoreOversaleLimit implements IStoreOversaleLimit{
    id: string;
    version: number;

    storeId: string;
    Store?: IStore;

    cartMax: number;

    buds: number;
    shakeTrim: number;
    plants: number;
    infusedNonEdible: number;
    infusedEdible: number;
    concentrate: number;

    constructor(obj?: IStoreOversaleLimit) {
        Object.assign(this, obj);
    }


}
