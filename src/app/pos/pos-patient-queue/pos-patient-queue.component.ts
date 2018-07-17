import {environment} from "../../../environments/environment";
import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {IPatient} from "../../models/interfaces/patient.interface";
import {Patient} from "../../models/patient.model";
import {PosCartService} from "../../services/pos-cart.service";
import {PatientService} from "../../services/patient.service";
import {PatientCartWithStart} from "./patient-cart-with-start";
import {UserService} from "../../services/user.service";
import {PatientQueueService} from "../../services/patient-queue.service";
import {IUser} from "../../models/interfaces/user.interface";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-pos-patient-queue',
    templateUrl: './pos-patient-queue.component.html',
    styleUrls: ['./pos-patient-queue.component.css']
})
export class PosPatientQueueComponent implements OnInit {

    @Input() patientQueue: PatientCartWithStart[];

    @Output() patientSelected: EventEmitter<PatientCartWithStart> = new EventEmitter();
    @Output() newPatient: EventEmitter<PatientCartWithStart> = new EventEmitter();

    _newPatient: IPatient;

    notFound: boolean = false;
    invalidEmail: boolean = false;
    invalidPhone: boolean = false;
    userSubscription: Subscription;

    user: IUser;

    constructor(private patientService: PatientService, private patientQueueService: PatientQueueService, private cartService: PosCartService, private userService: UserService) {
    }

    ngOnInit() {

        this.userSubscription = this.userService.userEmitted
          .subscribe(user => {
              this.user = user;
          });

        this._newPatient = this.patientService.newInstance();

        let patient = this.patientService.newInstance();
        patient.firstName = 'Guest';
        patient.lastName = 'Patient';

        let newPatient = {
            patient: patient,
            cart: this.cartService.newInstance(),
            startTime: new Date()
        };


        if(!environment.shouldShowPatientQueue) {
            this.newPatient.emit(newPatient);
        }
    }

    selectPatient(patient: PatientCartWithStart) {
        this.patientService.showPatientIDModal(patient.patient, "Register");

        //console.log("Select patient");
        this.patientQueueService.markCartStatus(patient.patient.id, true, this.user.id);
        this.patientSelected.emit(patient);
    }

    selectGuestPatient(){
        let patient = this.patientService.newInstance();
        patient.firstName = 'Guest';
        patient.lastName = 'Patient';
        patient.gramLimit = 0;

        let newPatient = {
            patient: patient,
            cart: this.cartService.newInstance(),
            startTime: new Date()
        };
        this.patientSelected.emit(newPatient);
        console.log(patient);
    }


    validatePhone(phone: string){
        return phone.replace(/^\d/gi, '').length === 10;
    }

    async saveAndSelectNewPatient() {

        let validEmail = true;
        if(this._newPatient.emailAddress){
            validEmail = await this.userService.validateEmail(this._newPatient.emailAddress);
        }

        let validPhone = true;
        if(this._newPatient.phoneNumber){
            validPhone = this.validatePhone(this._newPatient.phoneNumber);
        }

        if(!validPhone || !validEmail){
            this.invalidPhone = !validPhone;
            this.invalidEmail = !validEmail;
            return;
        }else{
            let newPatient = {
                patient: this._newPatient,
                cart: this.cartService.newInstance(),
                startTime: new Date()
            };

            this._newPatient = this.patientService.newInstance();

            this.newPatient.emit(newPatient);
        }



    }

    async saveAndSelectNewGuestPatient() {

        let patient = this.patientService.newInstance();
        patient.firstName = 'Guest';
        patient.lastName = 'Patient';

        let newPatient = {
            patient: patient,
            cart: this.cartService.newInstance(),
            startTime: new Date()
        };

        this._newPatient = this.patientService.newInstance();

        this.newPatient.emit(newPatient);

    }

    clearNewPatient() {
        this._newPatient = this.patientService.newInstance();
    }

    findExistingPatient(identifier: string) {
        this.notFound = false;
        let patient = this.patientService.findByIdentifier(identifier);

        patient.take(1).subscribe(patient => {
            console.log(patient);
            if(patient) {
                this.newPatient.emit({
                    patient: patient,
                    cart: this.cartService.newInstance(),
                    startTime: new Date()
                });
            }else{
                this.notFound = true;
            }
        })

    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

    viewPurchaseHistory(event: Event, patient: IPatient){
        event.stopPropagation();

        this.patientService.showPreviousPurchasesModal(patient, 'POS Queue');
    }
}
