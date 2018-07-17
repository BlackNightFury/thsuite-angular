import {ICommon} from "./common.interface";

export interface IEmailSettings extends ICommon{

    userId: string;
    lowInventory: boolean;
    autoClosedPackages: boolean;

    taxesReport: boolean;
}
