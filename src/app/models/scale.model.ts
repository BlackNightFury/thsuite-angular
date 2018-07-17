import {IScale} from "./interfaces/scale.interface";
export class Scale implements IScale{
    id: string;
    version: number;

    deviceProxyId: string;
    port: string;
    name: string;
    isEnabled: boolean;

    constructor(obj?: IScale){
        Object.assign(this, obj);
    }
}
