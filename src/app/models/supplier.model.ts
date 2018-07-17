import {ISupplier} from "./interfaces/supplier.interface";
export class Supplier implements ISupplier {
    id: string;
    version: number;

    name: string;

    streetAddress: string;
    city: string;
    state: string;
    zip: string;
    phone: string;

    contactName: string;

    constructor(obj: ISupplier) {
        Object.assign(this, obj);
    }


}
