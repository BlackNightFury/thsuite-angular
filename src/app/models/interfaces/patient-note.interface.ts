import {ICommon} from "./common.interface";
import {IPatient} from "./patient.interface";
import {IUser} from "./user.interface";
export interface IPatientNote extends ICommon{
    patientId: string;
    Patient?: IPatient;

    authorId: string;
    Author?: IUser;

    note: string;

    createdAt: Date;
}
