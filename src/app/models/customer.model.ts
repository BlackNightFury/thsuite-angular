import {ICustomer} from "./interfaces/customer.interface";

export class Customer implements ICustomer {
    id: string;
    version: number;

    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    points: number;
    constructor(obj: ICustomer) {
        Object.assign(this, obj);
    }
}
