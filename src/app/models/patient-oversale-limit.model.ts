import {IPatientOversaleLimit} from "./interfaces/patient-oversale-limit.interface";
import {IPatient} from "./interfaces/patient.interface";
export class PatientOversaleLimit implements IPatientOversaleLimit {
    id: string;
    version: number;

    patientId: string;
    Patient?: IPatient;

    cartMax: number;
/*
    buds: number;
    shakeTrim: number;
    plants: number;
    infusedNonEdible: number;
    infusedEdible: number;
    concentrate: number;
*/

    constructor(obj?: IPatientOversaleLimit) {
        Object.assign(this, obj);
    }
}
