import {IPrinter} from "./interfaces/printer.interface";
export class Printer implements IPrinter{
    id: string;
    version: number;

    deviceProxyId: string;
    port: string;
    name: string;
    isEnabled: boolean;

    constructor(obj?: IPrinter){
        Object.assign(this, obj);
    }
}

