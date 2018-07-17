import {ICaregiver} from "./interfaces/caregiver.interface";

export class Caregiver implements ICaregiver {

    id: string;
    version: number;

    firstName: string;
    lastName: string;

    emailAddress: string;
    phoneNumber: string;

    medicalStateId: string;

    birthday: Date; 

    constructor(obj: ICaregiver) {
        Object.assign(this, obj);
    }
}
