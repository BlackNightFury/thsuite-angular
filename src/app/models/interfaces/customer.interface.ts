import {ICommon} from "./common.interface";

export interface ICustomer extends ICommon {
    id: string;
    version: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    points: number;
}
