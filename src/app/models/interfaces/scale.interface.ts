import {ICommon} from "./common.interface";
export interface IScale extends ICommon{

    deviceProxyId: string;
    port: string;
    name: string;
    isEnabled: boolean;

}
