import {IPatient} from "./interfaces/patient.interface";
import {IPatientGroup} from "./interfaces/patient-group.interface";

export class PatientGroup implements IPatientGroup {
    id: string;
    version: number;

    name: string;
    description: string;


    constructor(obj: IPatientGroup) {
        Object.assign(this, obj);
    }
}
