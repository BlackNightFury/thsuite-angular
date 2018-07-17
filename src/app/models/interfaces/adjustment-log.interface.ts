import {ICommon} from "./common.interface";

export interface IAdjustmentLog extends ICommon {
    id: string;
    adjustmentId: string;
    quantityBefore: number;
    quantityAfter: number;
}