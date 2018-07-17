import {IPatientNote} from "./interfaces/patient-note.interface";
import {IPatient} from "./interfaces/patient.interface";
import {IUser} from "./interfaces/user.interface";
export class PatientNote implements IPatientNote{
    id: string;
    version: number;

    patientId: string;
    Patient?: IPatient;

    authorId: string;
    Author?: IUser;

    note: string;

    createdAt: Date;

    constructor(obj: IPatientNote) {

        Object.assign(this, obj);
    }
}
