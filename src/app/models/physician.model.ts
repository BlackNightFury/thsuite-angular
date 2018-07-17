import {IPhysician} from "./interfaces/physician.interface";

export class Physician implements IPhysician {
    id: string;
    version: number;

    firstName: string;
    lastName: string;

    emailAddress: string;
    phoneNumber: string;

    clinicName: string;
    address: string;
    city: string;
    state: string;
    zip: string;

    constructor(obj: IPhysician) {
        Object.assign(this, obj);
    }
}
