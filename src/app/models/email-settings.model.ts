import {IEmailSettings} from "./interfaces/email-settings.interface";

export class EmailSettings implements IEmailSettings{

    id: string;
    version: number;

    userId: string;

    lowInventory: boolean;
    autoClosedPackages: boolean;

    taxesReport: boolean;

    constructor(obj?: IEmailSettings){
        Object.assign(this, obj);
    }

}
