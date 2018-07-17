import {ICommon} from "./common.interface";
import {IStoreSettings} from "./store-settings.interface";

export interface IStore extends ICommon {

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
}
