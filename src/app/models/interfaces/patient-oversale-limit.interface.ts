import {ICommon} from "./common.interface";
import {IPatient} from "./patient.interface";
export interface IPatientOversaleLimit extends ICommon {
    patientId: string;
    Patient?: IPatient;

    cartMax: number;
    // buds: number;
}
