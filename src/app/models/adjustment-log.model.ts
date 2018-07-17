import {IAdjustmentLog} from "./interfaces/adjustment-log.interface";

export class AdjustmentLog implements IAdjustmentLog{
    id: string;
    version: number;
    adjustmentId: string;
    quantityBefore: number;
    quantityAfter: number;

    constructor(obj: IAdjustmentLog) {
        Object.assign(this, obj);
    }
}