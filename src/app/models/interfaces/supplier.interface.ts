import {ICommon} from "./common.interface";

export interface ISupplier extends ICommon {

    name: string;

    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;

    contactName: string;

}
