import {ICommon} from "./common.interface";
export interface IPrinter extends ICommon{

    deviceProxyId: string;
    port: string;
    name: string;
    isEnabled: boolean;

}
