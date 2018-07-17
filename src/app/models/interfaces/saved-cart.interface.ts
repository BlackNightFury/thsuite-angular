import {ICommon} from "./common.interface";

export interface ISavedCart extends ICommon {

    id: string;
    version: number;
    patientId: string;
    patientQueueId: string;
    cartData: string;
}
