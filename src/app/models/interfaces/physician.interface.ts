import {ICommon} from "./common.interface";

export interface IPhysician extends ICommon {

    firstName: string;
    lastName: string;

    emailAddress: string;
    phoneNumber: string;

    clinicName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}
