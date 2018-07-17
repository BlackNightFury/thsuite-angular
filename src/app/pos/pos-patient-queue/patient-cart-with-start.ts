
import {IPatient} from "../../models/interfaces/patient.interface";
import {Cart} from "../../models/cart.model";
import {ICaregiver} from "../../models/interfaces/caregiver.interface";

export interface PatientCartWithStart {
    patient: IPatient,
    cart: Cart
    startTime: Date,
    caregiver?: ICaregiver,
    patientQueueId?: string,
    budtenderId?: string
}
