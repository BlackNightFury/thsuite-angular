import {ICommon} from "./common.interface";
import {IPatientGroup} from "./patient-group.interface";
import {IPhysician} from "./physician.interface";
import {IPatientNote} from "./patient-note.interface";

export interface IPatient extends ICommon {

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
}
