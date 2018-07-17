import {IStore} from "./interfaces/store.interface";
import {IStoreSettings} from "./interfaces/store-settings.interface";
import * as moment from 'moment-timezone';

export class Store implements IStore {
    id: string;
    version: number;

    name: string;
    metrcName: string;
    metrcAlias: string;
    licenseNumber: string;
    licenseType: string;
    city: string;
    settings?: IStoreSettings;
    state: string;
    storeManager: string;
    taxesIncluded: boolean;
    timeZone: string;


    constructor(obj: IStore) {
        Object.assign(this, obj);
    }

    get timeZoneOffset() {
        return moment().tz(this.timeZone).format('ZZ')
    }
}
