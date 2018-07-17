import {ICommon} from "./common.interface";
import {IPatient} from "./patient.interface";
import {ICaregiver} from "./caregiver.interface";
import {IUser} from "./user.interface";

export interface IPatientQueue extends ICommon {

    patientId: string;
    Patient?: IPatient;

    caregiverId: string;
    Caregiver?: ICaregiver;

    cartOpen: boolean;

    source: string;

    verifiedAt: Date;
    enteredAt: Date;

    budtenderId: string;
    Budtender?:IUser;
}
