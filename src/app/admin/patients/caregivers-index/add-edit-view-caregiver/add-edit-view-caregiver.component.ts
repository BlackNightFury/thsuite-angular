import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {CaregiverService} from "../../../../services/caregiver.service";
import {Component, ElementRef, Injector, OnInit, ViewChild} from "@angular/core";
import {ICaregiver} from "../../../../models/interfaces/caregiver.interface";
import {PatientService} from "../../../../services/patient.service";
import * as moment from 'moment';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-add-edit-view-caregiver',
    templateUrl: './add-edit-view-caregiver.component.html'
})
export class AddEditViewCaregiverComponent extends AddEditViewObjectComponent<ICaregiver> implements OnInit{
    @ViewChild('root')overlayRoot: ElementRef;

    maxBirthday: Date = moment().subtract(environment.caregiverMinimumAge, 'years').toDate();

    errors: string[];

    errorFlags: any = {
        firstName: false,
        lastName: false,
        medicalStateId: false,
        emailAddress: false,
        birthday: false
    };

    constructor(injector: Injector, private caregiverService: CaregiverService, private patientService: PatientService){
        super(injector, caregiverService);
    }

    ngOnInit(){
        super.ngOnInit();
    }

    edit(){
        this.caregiverService.edit(this.object);
    }

    cancel(){
        this.caregiverService.list();
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    async save(){

        this.clearErrorFlags();
        let errors = [];

        if(!this.object.firstName) {
            errors.push("First Name is a required field.");
            this.errorFlags.firstName = true;
        }
        if(!this.object.lastName) {
            errors.push("Last Name is a required field.");
            this.errorFlags.lastName = true;
        }
        if(!this.object.medicalStateId) {
            errors.push("Medical / State ID is a required field.");
            this.errorFlags.medicalStateId = true;
        } else if(!this.caregiverService.validateMedicalId(this.object.medicalStateId)) {
            errors.push("Enter a valid Medical / State id.");
            this.errorFlags.medicalStateId = true;
        } else if(!(await this.caregiverService.validateMedicalIdUnique(this.object.medicalStateId, this.object.id))){
            errors.push("Medical / State ID must be unique. This ID already exists for another caregiver");
            this.errorFlags.medicalStateId = true;
        }

        if(!this.object.birthday) {
            errors.push("Enter a valid birthday.");
            this.errorFlags.birthday = true;
        }

        if(!this.object.phoneNumber && !this.object.emailAddress) {
            errors.push("At least one of Phone Number or Email Address is a required.");
            this.errorFlags.phoneNumber = true;

            this.errorFlags.emailAddress = true;
        }

        if(this.object.phoneNumber && this.object.phoneNumber.length > 10) {
            errors.push("Phone Number cannot exceed 10 digits.");
            this.errorFlags.phoneNumber = true;
        }

        if(this.object.emailAddress && !(await this.patientService.validateEmail(this.object.emailAddress))) {
            errors.push("Enter a valid email address.");
            this.errorFlags.emailAddress = true;
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.caregiverService.save(this.object, () => {
            this.caregiverService.list();
        });

    }

    remove(){
        this.caregiverService.remove(this.object);
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '$1-$2');
        output = output.replace(/^(\d{3})-(\d{3})(\d{1})/, '$1-$2-$3');
        event.target.value = output;
    }

    setPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.object.phoneNumber = numbersOnlyPhoneNumber;
    }

    setMedicalStateId(medicalStateId: string) {
        var alphanumericOnlyMedId = medicalStateId.replace(/[^a-zA-Z0-9]+/g, '');

        this.object.medicalStateId = alphanumericOnlyMedId;
    }

    filterNumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || key > 57) e.preventDefault();
    }

    filterAlphanumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || (key > 57 && key < 65 ) || (key > 90 && key < 97) || key > 122) e.preventDefault();
    }
}
