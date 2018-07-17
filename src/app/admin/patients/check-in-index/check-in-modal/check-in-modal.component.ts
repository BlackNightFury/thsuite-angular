import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PatientQueueService} from "../../../../services/patient-queue.service";
import {PatientService} from "../../../../services/patient.service";
import {IPatient} from "../../../../models/interfaces/patient.interface";

import * as moment from 'moment-timezone';
import {PhysicianService} from "../../../../services/physician.service";
import {IPatientQueue} from "../../../../models/interfaces/patient-queue.interface";
import {StoreService} from "../../../../services/store.service";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {Lightbox} from "angular2-lightbox";
import {ICaregiver} from "../../../../models/interfaces/caregiver.interface";
import {CaregiverService} from "../../../../services/caregiver.service";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PatientGroupService} from "../../../../services/patient-group.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {CountyService} from "../../../../services/county.service";
import {environment} from "../../../../../environments/environment";

declare const $: any;

@Component({
    selector: "app-check-in-modal",
    templateUrl: './check-in-modal.component.html',
    styleUrls: ['./check-in-modal.component.css']
})
export class CheckInModalComponent implements OnInit, AfterViewInit, OnDestroy{

    environment = environment;

    protected dialog;

    patient: IPatient;
    patientQueue: IPatientQueue;
    caregiver: ICaregiver;
    mode: 'verify'|'enter';

    errors: string[];
    sectionErrors : string[];

    timeZone: string;

    maxBirthday: Date = moment().subtract(18, 'years').toDate();
    maxCaregiverBirthday: Date = moment().subtract(environment.caregiverMinimumAge, 'years').toDate();

    editingPatient: boolean = false;
    editingPhysician: boolean = false;
    editingCaregiver: boolean = false;

    editingGramLimit: boolean = false;
    gramLimit: number;
    oldGramLimit: number;

    editingMedicalId: boolean = false;

    physicianSelect2Options: Select2Options;
    addingNewPhysician: boolean = false;

    patientErrorFlags: any = {
        firstName: false,
        lastName: false,
        patientType: false,
        patientGroupId: false,
        medicalStateId: false,
        gramLimit: false,
        patientMedicalConditions: false,
        birthday: false,
        phoneNumber: false,
        emailAddress: false,
        address: false,
        zip: false,
        city: false,
        state: false,
        referrer: false
    };

    physicianErrorFlags: any = {
        firstName: false,
        lastName: false,
        clinicName: false,
        address: false,
        city: false,
        state: false,
        zip: false
    };

    caregiverErrorFlags: any = {
        firstName: false,
        lastName: false,
        medicalStateId: false,
        emailAddress: false,
        birthday: false
    };

    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;

    countySelect2Options: Select2Options;
    patientGroupSelect2Options: Select2Options;

    medicalConditionsSelect2Options: Select2Options;
    addingNewCondition: boolean = false;

    patientSubscription: Subscription;

    minExpDate = new Date();

    showConfirm: boolean = false;
    showVerifyEnter: boolean = true;

    constructor(
        private element: ElementRef,
        private http: Http,
        private lightbox: Lightbox,
        private patientService: PatientService,
        private patientQueueService: PatientQueueService,
        private patientGroupService: PatientGroupService,
        private physicianService: PhysicianService,
        private caregiverService: CaregiverService,
        private storeService: StoreService,
        private loadingBarService: SlimLoadingBarService,
        private countyService:CountyService
    ){

    }

    ngOnInit(){

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.timeZone = store.timeZone;
        } );

        this.countySelect2Options = {
            data: this.countyService.counties
        };

        this.patientSubscription = this.patientService.checkInModalPatient.subscribe(patientId => {

            this.patientService.getAssociated(patientId).take(1).subscribe(patient => {
                console.log(patient);
                this.patient = this.patientService.dbInstance(patient);
                this.gramLimit = this.patient.gramLimit;
                this.physicianService.get(this.patient.physicianId).subscribe((physician) => {
                    if(physician.id){
                        this.patient.Physician = physician;
                    }
                });
            })

            this.patientQueueService.getByPatientId(patientId).take(1).subscribe(patientQueue => {
                console.log(patientQueue);
                this.patientQueue = this.patientQueueService.dbInstance(patientQueue);
                this.mode = this.patientQueue.verifiedAt ? 'enter' : 'verify';
                if(this.patientQueue.caregiverId){
                    this.caregiver = this.caregiverService.dbInstance(this.patientQueue.Caregiver);
                }else{
                    this.caregiver = null;
                }

                if(this.patientQueue.source !== 'desktop'){
                    this.oldGramLimit = this.patient.gramLimit;
                    this.patient.gramLimit = undefined;
                    this.gramLimit = undefined;
                }

                var title = (this.mode == "verify") ? "Patient Verification" : "Patient Information";

                this.dialog.dialog({ title: title });
            });

            this.medicalConditionsSelect2Options = {
                multiple: true,
                data: this.patientService.patientMedicalConditions.map(condition => {
                    return {id: condition, text: condition}
                }),
                placeholder: "Select a medical condition..."
            }

        });

        Observable.combineLatest(
            CommonAdapter(this.patientGroupService, 'id', 'name'),
            CommonAdapter(this.physicianService, 'id', physician => `${physician.firstName} ${physician.lastName}` )
        ).toPromise()
            .then(([PatientGroupAdapter, PhysicianAdapter]) => {

                this.patientGroupSelect2Options = {
                    ajax: {}
                };
                this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;

                this.physicianSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Physician'
                };
                this.physicianSelect2Options['dataAdapter'] = PhysicianAdapter;
            });
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Loading Patient...",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 800,
                width: 800,
                classes: {
                    "ui-dialog": "check-in-modal"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    //If patient came from other than desktop, and gramLimit is undefined, then reset to old
                    if(this.patientQueue.source !== 'desktop' && this.patient.gramLimit === undefined){
                        this.patient.gramLimit = this.oldGramLimit;
                    }
                    this.patientService.hidePatientCheckInModal();
                }
            });

        this.dialog = $dialog;
    }

    ngOnDestroy(){
        this.patientSubscription && this.patientSubscription.unsubscribe();
    }

    editPatient(){
        this.editingPatient = true;

        //Check if medical condition is in predefined conditions
        let predefinedConditions = this.patientService.patientMedicalConditions;
        if(this.patient.patientMedicalConditions && this.patient.patientMedicalConditions.length === 1 && predefinedConditions.indexOf(this.patient.patientMedicalConditions[0]) == -1 && this.patient.patientMedicalConditions[0]){
            this.addingNewCondition = true;
        }
    }

    editPhysician(){
        if (!this.patient.Physician) {
            this.patient.Physician = this.physicianService.newInstance();
        }

        this.editingPhysician = true;
    }
    editCaregiver(){
        this.editingCaregiver = true;
        this.caregiver.medicalStateId = this.formatMedID(this.caregiver.medicalStateId);
    }

    editGramLimit(){
        this.editingGramLimit = true;
    }

    saveGramLimit(){

        if(isNaN(this.gramLimit)) return;

        this.patientService.setGramLimit(this.patient.id, this.gramLimit, (success) => {
            if(success){
                this.patient.gramLimit = this.gramLimit;
                this.editingGramLimit = false;
            }
        });
    }

    editMedicalId(){
        this.editingMedicalId = true;
    }

    saveMedicalId(){

        if(!this.patient.medicalStateId){
            this.errors = ['Cannot save a blank patient medical ID'];
            this.patientErrorFlags.medicalStateId = true;
            return;
        }

        this.patientService.setMedicalId(this.patient.id, this.patient.medicalStateId, (success) => {
            this.errors = [];
            if(success){
                this.editingMedicalId = false;
            }
        })

    }

    newPhysician(){
        this.addingNewPhysician = true;
        this.patient.physicianId = undefined;
        this.patient.Physician = this.physicianService.newInstance();
    }

    backToPredefinedPhysicians(){
        this.addingNewPhysician = false;
        this.patient.Physician = this.physicianService.newInstance();
    }

    newCondition(){
        this.addingNewCondition = true;
        this.patient.patientMedicalConditions = [];
    }

    backToPredefined(){
        this.addingNewCondition = false;
        // If it's empty Select2 will select ALL options
        this.patient.patientMedicalConditions = null;
    }

    clearErrorFlags(type: string){
        let errorFlags;
        if(type == 'patient'){
            errorFlags = this.patientErrorFlags;
        }else if(type == 'physician'){
            errorFlags = this.physicianErrorFlags;
        }else if(type == 'caregiver'){
            errorFlags = this.caregiverErrorFlags;
        }

        Object.keys(errorFlags).forEach(key => {
            errorFlags[key] = false;
        });
    }

    clearSectionErrorFlags(){
        this.sectionErrors = [];
    }

    validateGramLimit(): boolean{
        let errors = [];
        if(!this.patient.gramLimit){
            errors.push("Patient Gram Limit must be set.");
            this.patientErrorFlags.gramLimit = true;
        }

        if(errors.length) {
            this.dialog.scrollTop(0);

            return false;
        }

        return true;

    }

    async validatePatient():Promise<boolean>{
        this.clearErrorFlags('patient');
        let errors = [];

        if(!this.patient.firstName) {
            errors.push("First Name is a required field.");
            this.patientErrorFlags.firstName = true;
        }
        if(!this.patient.lastName) {
            errors.push("Last Name is a required field.");
            this.patientErrorFlags.lastName = true;
        }

        if(!this.patient.birthday) {
            errors.push("Birthday is a required field.");
            this.patientErrorFlags.birthday = true;
        } else if(!moment(this.patient.birthday).isValid() || (moment(this.patient.birthday) > moment(dateLimit))) {
            errors.push("Enter a valid birthday.");
            this.patientErrorFlags.birthday = true;
        }

        if(!this.patient.medicalStateId) {
            errors.push("Medical / State ID is a required field.");
            this.patientErrorFlags.medicalStateId = true;
        } else if(!this.patientService.validateMedicalStateId(this.patient.medicalStateId)) {
            errors.push("Enter a valid medical / state id.");
            this.patientErrorFlags.medicalStateId = true;
        }

        if(!this.patient.expirationDate && environment.shouldShowPatientIDExpiration) {
            errors.push("Expiration Date is a required field.");
            this.patientErrorFlags.expirationDate = true;
        }

        if(!this.patient.driversLicenseId && !this.patient.passportId && !this.patient.otherStateId) {
            errors.push("At least one of Driver's License ID, Passport ID or Other State ID is a required.");

            this.patientErrorFlags.driversLicenseId = true;

            this.patientErrorFlags.passportId = true;

            this.patientErrorFlags.otherStateId = true;
        }

        if(!this.patient.county){
            errors.push("County is a required field.");
            this.patientErrorFlags.county = true;
        }

        if (this.environment.requirePatientAddress) {
            if(!this.patient.city){
                errors.push("City is a required field.");
                this.patientErrorFlags.city = true;
            }

            if(!this.patient.state){
                errors.push("State is a required field.");
                this.patientErrorFlags.state = true;
            }

            if(!this.patient.address){
                errors.push("Address is a required field.");
                this.patientErrorFlags.address = true;
            }

            if(!this.patient.zip) {
                errors.push("Zipcode is a required field.");
                this.patientErrorFlags.zip = true;
            } else if(this.patient.zip.length != 5){
                errors.push("Enter a valid zipcode.");
                this.patientErrorFlags.zip = true;
            }
        }

        var dateLimit = new Date();
        dateLimit.setUTCFullYear((dateLimit.getUTCFullYear() - 18));

        if(!this.patient.phoneNumber && !this.patient.emailAddress) {
            errors.push("At least one of Phone Number or Email Address is a required.");
            this.patientErrorFlags.phoneNumber = true;

            this.patientErrorFlags.emailAddress = true;
        }

        if(this.patient.phoneNumber && this.patient.phoneNumber.length > 10) {
            errors.push("Phone Number cannot exceed 10 digits.");
            this.patientErrorFlags.phoneNumber = true;
        }

        if(this.patient.emailAddress && !(await this.patientService.validateEmail(this.patient.emailAddress))) {
            errors.push("Enter a valid email address.");
            this.patientErrorFlags.emailAddress = true;
        }

        if(!this.patient.patientType) {
            errors.push("Patient Type is a required field.");
            this.patientErrorFlags.patientType = true;
        }
        if(!this.patient.patientGroupId) {
            errors.push("Patient Group is a required field.");
            this.patientErrorFlags.patientGroupId = true;
        }

        if(!this.patient.patientMedicalConditions && !this.patient.patientMedicalConditions){
            errors.push("Medical condition is a required field.");
            this.patientErrorFlags.patientMedicalConditions = true;
        }

        if(this.environment.requirePatientReferrer && !this.patient.referrer){
            errors.push("Referrer is a required field.");
            this.patientErrorFlags.referrer = true;
        }

        this.errors = errors;

        if(errors.length) {
            this.dialog.scrollTop(0);

            return false;
        }

        return true;
    }

    async savePatient(){
        this.clearSectionErrorFlags();

        if(await this.validatePatient()){
            this.patientService.save(this.patient, false, () => {
                this.editingPatient = false;
                this.addingNewCondition = false;
            });
        }
    }

    async validatePhysician():Promise<boolean>{
        this.clearErrorFlags('physician');
        let errors = [];

        if(!this.addingNewPhysician && !this.patient.physicianId){
            errors.push("Physician is a required field.");
            this.physicianErrorFlags.id = true;

        } else if(this.addingNewPhysician) {

            if(!this.patient.Physician.firstName) {
                errors.push("First Name is a required field.");
                this.physicianErrorFlags.firstName = true;
            }
            if(!this.patient.Physician.lastName) {
                errors.push("Last Name is a required field.");
                this.physicianErrorFlags.lastName = true;
            }

            if(!this.patient.Physician.clinicName) {
                errors.push("Clinic Name is a required field.");
                this.physicianErrorFlags.clinicName = true;
            }
        }

        if(errors.length) {
            return false;
        }

        return true;
    }

    async savePhysician(){
        this.clearSectionErrorFlags();

        if(await this.validatePhysician()){
            this.physicianService.save(this.patient.Physician, false, () => {
                if (!this.patient.physicianId) {
                    this.patient.physicianId = this.patient.Physician.id;
                }

                this.patientService.save(this.patient, false, () => {
                    this.editingPhysician = false;
                });

                this.addingNewPhysician = false;

                this.physicianService.get(this.patient.physicianId).subscribe((physician) => {
                    this.patient.Physician = physician;
                });
            });
        }
    }

    async validateCaregiver():Promise<boolean>{
        this.clearErrorFlags('caregiver');
        let errors = [];

        if(!this.caregiver.firstName) {
            errors.push("First Name is a required field.");
            this.caregiverErrorFlags.firstName = true;
        }
        if(!this.caregiver.lastName) {
            errors.push("Last Name is a required field.");
            this.caregiverErrorFlags.lastName = true;
        }
        // if(!this.caregiver.medicalStateId) {
        //     errors.push("Medical / State ID is a required field.");
        //     // this.caregiverErrorFlags.medicalStateId = true;
        // }

        if(!this.caregiver.birthday) {
            this.caregiverErrorFlags.birthday = true;
            errors.push("Birthday is a required field.");
        }

        if(!this.caregiver.phoneNumber && !this.caregiver.emailAddress) {
            errors.push("At least one of Phone Number or Email Address is a required.");
            this.caregiverErrorFlags.phoneNumber = true;

            this.caregiverErrorFlags.emailAddress = true;
        }

        if(this.caregiver.phoneNumber && this.caregiver.phoneNumber.length > 10) {
            errors.push("Phone Number cannot exceed 10 digits.");
            this.caregiverErrorFlags.phoneNumber = true;
        }

        if(this.caregiver.emailAddress && !(await this.patientService.validateEmail(this.caregiver.emailAddress))) {
            errors.push("Enter a valid caregiver email address.");
            this.caregiverErrorFlags.emailAddress = true;
        }

        if(errors.length) {

            return false;
        }

        return true;
    }

    async saveCaregiver(){
        this.clearSectionErrorFlags();

        if(await this.validateCaregiver()){
            this.caregiver.medicalStateId = this.caregiver.medicalStateId.replace(/[^a-zA-Z0-9]/g, '');

            this.caregiverService.save(this.caregiver, () => {
                this.editingCaregiver = false;
            });
        }
    }

    cancelEditing(type: string){
        if(type == 'patient'){
            this.editingPatient = false;
        }else if(type == 'physician'){
            this.editingPhysician = false;
        }
    }

    async validateAll(){
        this.clearSectionErrorFlags();

        var physicianMissing = false;

        if(!this.validateGramLimit()){
            console.log(this.errors);
            return false;
        }

        if(!(await this.validatePatient())) {
            this.editingPatient = true;
            return false;
        } else if (this.editingPatient) {
            this.sectionErrors.push("Save patient details before advancing.");
        }

        if(this.patient.Physician && !(await this.validatePhysician())) {
            this.editingPhysician = true;
            return false;
        } else if(this.editingPhysician) {
            this.sectionErrors.push("Save physician details before advancing.");
        }

        if(this.caregiver && !(await this.validateCaregiver())) {
            this.editingCaregiver = true;
            return false;
        } else if(this.editingCaregiver) {
            this.sectionErrors.push("Save caregiver details before advancing.");
        }

        if (!this.patient.Physician || (!this.patient.Physician.firstName || !this.patient.Physician.lastName || !this.patient.Physician.clinicName)) {

            this.sectionErrors.push("You must enter Physician information");

            physicianMissing = true;

            this.editPhysician();
        }

        if(this.editingPatient || this.editingPhysician || this.editingCaregiver || physicianMissing){

            this.dialog.scrollTop(0);

            return false;
        }

        return true;
    }

    showConfirmation(){
        this.showConfirm = true;
        this.showVerifyEnter = false;
    }

    async verifyOrEnter(){

        if(!(await this.validateAll())) {
            return false;
        }

        if(this.mode == 'verify'){
            this.patientQueue.verifiedAt = moment().tz(this.timeZone).utc();
        }else if(this.mode == 'enter'){
            this.patientQueue.enteredAt = moment().tz(this.timeZone).utc();
        }

        this.patientQueueService.save(this.patientQueue, false, () => {
            this.dialog.dialog('close');
        });
    }

    async verifyAndEnter() {

        if(!(await this.validateAll())) {
            return false;
        }

        const now = moment().tz(this.timeZone).utc();
        this.patientQueue.verifiedAt = now;
        this.patientQueue.enteredAt = now;

        this.patientQueueService.save(this.patientQueue, false, () => {
            this.dialog.dialog('close');
        });
    }

    formatDate(date){
        if(!date){
            return null;
        }

        var newDate = new Date(date);

        // We don't care timezone on birthday
        return moment(newDate).format("M/DD/YYYY");
    }

    formatMedIDFromEvent(event: any){
        event.target.value = PatientService.formatPatientMedicalId(event.target.value);
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }

    uploadImage($event: FileHolder, patientField = 'idImage') {

        console.log("Upload called!");
        this.loadingBarService.interval = 100;
        this.loadingBarService.start();

        this.patientService.getUploadParams('image/*')
            .then(params => {
                console.log(params);

                var sanitizedFileName = $event.file.name.replace(/[^\w.]+/g, "_");

                const formData = new FormData();

                formData.append('key', params.name);
                formData.append('AWSAccessKeyId', params.key);
                formData.append('policy', params.policy);
                formData.append('success_action_status', '201');
                formData.append('signature', params.signature);
                formData.append('Content-Type', params.contentType);
                formData.append('file', $event.file, sanitizedFileName);

                return this.http
                    .post(params.action, formData)
                    .toPromise()
            })
            .then(response => {
                console.log(response);
                if (response.status !== 201) {
                    throw new Error('Error uploading image')
                }

                let $response = $(response._body);

                this.patient[patientField] = decodeURIComponent($response.find('Location').text());

                this.patientService.save(this.patient, false, () => {
                  this.loadingBarService.complete();
                });

                this.imageUploadComponent.deleteAll();
            })
            .catch(err => {
                alert(err.message);
                this.loadingBarService.complete();
            })

    }

    openUrl(url: string){
        window.open(url, "_blank");
    }

    setPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.patient.phoneNumber = numbersOnlyPhoneNumber;
    }

    setPhysicianPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.patient.Physician.phoneNumber = numbersOnlyPhoneNumber;
    }

    setCaregiverPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.caregiver.phoneNumber = numbersOnlyPhoneNumber;
    }

    setMedicalStateId(medicalStateId: string) {
        var alphanumericOnlyMedId = medicalStateId.replace(/[^a-zA-Z0-9]+/g, '');

        this.patient.medicalStateId = alphanumericOnlyMedId;
    }

    filterNumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || key > 57) e.preventDefault();
    }

    filterAlphanumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || (key > 57 && key < 65 ) || (key > 90 && key < 97) || key > 122) e.preventDefault();
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '$1-$2');
        output = output.replace(/^(\d{3})-(\d{3})(\d{1})/, '$1-$2-$3');
        event.target.value = output;
    }
}
