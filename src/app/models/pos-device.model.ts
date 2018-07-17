import {IPosDevice} from "./interfaces/pos-device.interface";
export class PosDevice implements IPosDevice{
    id: string;
    version: number;
    userId: string;

    constructor(obj?: IPosDevice){
        Object.assign(this, obj);
    }
}
