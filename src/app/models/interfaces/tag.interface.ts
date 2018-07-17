import {ICommon} from "./common.interface";

export interface ITag extends ICommon {
    storeId: string;
    value: string;
}
