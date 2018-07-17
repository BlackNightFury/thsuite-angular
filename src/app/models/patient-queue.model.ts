import {IPatient} from "./interfaces/patient.interface";
import {IPatientQueue} from "./interfaces/patient-queue.interface";
import {ICaregiver} from "./interfaces/caregiver.interface";
import {IUser} from "./interfaces/user.interface";

export class PatientQueue implements IPatientQueue {
    id: string;
    version: number;

    patientId: string;
    Patient?: IPatient;

    caregiverId: string;
    Caregiver?: ICaregiver;

    cartOpen: boolean;

    source: string;

    verifiedAt: Date;
    enteredAt: Date;

    budtenderId: string;
    Budtender?: IUser;

    constructor(obj: IPatientQueue) {
        Object.assign(this, obj);
    }

    get isNew(){
        return this.Patient && this.Patient.firstTimeInQueue == this.Patient.lastAddedToQueue;
    }
}
