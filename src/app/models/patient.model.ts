import {IPatient} from "./interfaces/patient.interface";
import {IPatientGroup} from "./interfaces/patient-group.interface";
import {IPhysician} from "./interfaces/physician.interface";
import * as moment from 'moment';
import {IPatientNote} from "./interfaces/patient-note.interface";
import {environment} from "../../environments/environment";

export class Patient implements IPatient {
    id: string;
    version: number;

    firstName: string;
    lastName: string;

    patientType: 'medical'|'recreational';

    patientGroupId: string;
    PatientGroup?: IPatientGroup;

    medicalStateId: string;
    expirationDate: string;
    birthday: string;
    phoneNumber: string;
    emailAddress: string;

    zip: string;
    city: string;
    state: string;
    county: string;
    address: string;

    gramLimit: number;

    patientMedicalConditions: string[];

    patientNotes: string;

    loyaltyPoints: number;

    driversLicenseId: string;
    passportId: string;
    otherStateId: string;

    amountRemaining: number;

    physicianId: string;
    Physician?: IPhysician;

    PatientNotes?: IPatientNote[];

    idImage: string;
    attestationForm: string;

    firstTimeInQueue: Date;
    lastAddedToQueue: Date;

    referrer: string;

    constructor(obj: IPatient) {
        if (obj.birthday && obj.birthday.substr) {
            obj.birthday = moment(obj.birthday.substr(0, 10)).endOf('day').format().toString();
        }

        if(environment.shouldShowPatientIDExpiration) {
            if (obj.expirationDate && obj.expirationDate.substr) {
                obj.expirationDate = moment(obj.expirationDate.substr(0, 10)).endOf('day').format().toString();
            }
        }
        Object.assign(this, obj);
    }
}
