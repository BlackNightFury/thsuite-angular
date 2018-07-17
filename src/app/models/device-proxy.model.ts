import {IDeviceProxy} from "./interfaces/device-proxy.interface";
export class DeviceProxy implements IDeviceProxy{
    id: string;
    version: number;

    name: string;

    constructor(obj?: IDeviceProxy){
        Object.assign(this, obj);
    }
}
