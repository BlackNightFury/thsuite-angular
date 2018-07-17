import {ICommon} from "./common.interface";

export interface ICaregiver extends ICommon {

    firstName: string;
    lastName: string;

    emailAddress: string;
    phoneNumber: string;

    medicalStateId: string;

    birthday: Date; 
}
