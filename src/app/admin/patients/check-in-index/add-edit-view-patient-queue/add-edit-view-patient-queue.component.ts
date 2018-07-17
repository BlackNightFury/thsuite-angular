import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {PatientGroupService} from "../../../../services/patient-group.service";
import {PatientService} from "../../../../services/patient.service";
import {PhysicianService} from "../../../../services/physician.service";
import {IPatient} from "../../../../models/interfaces/patient.interface";
import {PatientQueueService} from "../../../../services/patient-queue.service";
import {IPatientQueue} from "../../../../models/interfaces/patient-queue.interface";
import {didSet} from "../../../../lib/decorators/property/didSet";
import {CaregiverService} from "../../../../services/caregiver.service";
import {ICaregiver} from "../../../../models/interfaces/caregiver.interface";
import {IStore} from "../../../../models/interfaces/store.interface";
import {IPhysician} from "../../../../models/interfaces/physician.interface";
import {Physician} from "../../../../models/physician.model";
import {Subscription} from "rxjs/Subscription";
import {StoreService} from "../../../../services/store.service";
import {CountyService} from "../../../../services/county.service";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {environment} from "../../../../../environments/environment";
import * as moment from 'moment-timezone';
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

export function didSetPatient(newValue: string){
    if(newValue){
        this.patientService.getAssociated(newValue).subscribe(patient => {
            console.log("Selected Patient: ");
            console.log(patient);
            this.patient = this.patientService.dbInstance(patient);
            this.oldGramLimit = this.patient.gramLimit;
            this.patient.gramLimit = undefined;
            //Check if medical condition is in predefined conditions
            let predefinedConditions = this.patientService.patientMedicalConditions;
            if(this.patient.patientMedicalConditions && this.patient.patientMedicalConditions.length && predefinedConditions.indexOf(this.patient.patientMedicalConditions[0]) == -1 && this.patient.patientMedicalConditions[0]){
                this.addingNewCondition = true;
            }
        });
    } else {
        this.patient = null;
        this.oldGramLimit = undefined;
        this.addingNewCondition = false;
    }

    this.searchMessage = '';
    this.searchError = false;
    this.errorMessage = '';
    this.addingNewPhysician = false;
    this.newPhysicianObject = this.physicianService.newInstance();
}

export function didSetCaregiver(newValue: string){
    if(newValue){
        this.caregiverService.getAssociated(newValue).subscribe(caregiver => {
            console.log("Got caregiver");
            console.log(caregiver);
            this.caregiver = this.patientService.dbInstance(caregiver);
            this.caregiverMedicalID = this.caregiver.medicalStateId;
        });

        this.hasCaregiver = true;
    } else {
        this.caregiver = null;
        this.caregiverMedicalID = '';
        this.hasCaregiver = false;
    }

    this.searchMessage = '';
    this.searchError = false;
    this.errorMessage = '';
    this.addingNewPhysician = false;
    this.newPhysicianObject = this.physicianService.newInstance();
}

export function didSetHasCaregiver(newValue: string){

    if(!newValue){
        //If hasCaregiver is set to false, unset caregiver, med ID and search message
        this.caregiver = null;
        this.caregiverMedicalID = '';
        this.searchMessage = '';
        this.searchError = false;
        this.errorMessage = '';
    }
}

@Component({
    selector: 'app-add-edit-view-patient-queue',
    templateUrl: './add-edit-view-patient-queue.component.html',
    styleUrls: ['./add-edit-view-patient-queue.component.css']
})
export class AddEditViewPatientQueueComponent extends AddEditViewObjectComponent<IPatientQueue> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;
    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;

    environment = environment;

    patientSelect2Options: Select2Options;
    caregiverSelect2Options: Select2Options;

    @didSet(didSetPatient) selectedPatientId: string;
    @didSet(didSetCaregiver) selectedCaregiverId: string;

    caregiverSelectedFirst: boolean = false;

    patient: IPatient;
    oldGramLimit: number;

    newPhysicianObject: IPhysician;

    @didSet(didSetHasCaregiver) hasCaregiver: boolean = false;
    caregiverMedicalID: string;
    caregiver: ICaregiver;

    searchMessage: string = '';
    searchError: boolean = false;
    errorMessage: string = '';

    countySelect2Options: Select2Options;
    patientGroupSelect2Options: Select2Options;

    physicianSelect2Options: Select2Options;
    addingNewPhysician: boolean = false;

    medicalConditionsSelect2Options: Select2Options;
    addingNewCondition: boolean = false;

    verifyAddModalShowingSubscription:Subscription;

    minExpDate: Date = new Date();

    errors: string[];

    errorFlags: any = {
        firstName: false,
        lastName: false,
        patientType: false,
        patientGroupId: false,
        medicalStateId: false,
        driversLicenseId: false,
        passportId: false,
        otherStateId: false,
        expirationDate: false,
        birthday: false,
        phoneNumber: false,
        emailAddress: false,
        address: false,
        city: false,
        state: false,
        zip: false,
        referrer: false,
        caregiverFirstName: false,
        caregiverLastName: false,
        gramLimit: false
    };

    maxBirthday: Date = moment().subtract(18, 'years').toDate();
    maxCaregiverBirthday: Date = moment().subtract(environment.caregiverMinimumAge, 'years').toDate();

    verificationSubscription: Subscription;

    timeZone: string;

    store: IStore;

    showConfirm: boolean = false;
    showAdd: boolean = true;

    constructor(
        injector: Injector,
        private patientQueueService: PatientQueueService,
        private patientService: PatientService,
        private caregiverService: CaregiverService,
        private physicianService: PhysicianService,
        private patientGroupService: PatientGroupService,
        private storeService: StoreService,
        private loadingBarService: SlimLoadingBarService,
        private countyService: CountyService,
        private http: Http
    ) {
        super(injector, patientQueueService);
    }

    ngOnInit() {
        super.ngOnInit();

        this.newPhysicianObject = this.physicianService.newInstance();

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.timeZone = store.timeZone;
            this.store = store;
        } );

        this.countySelect2Options = {
            data: this.countyService.counties
        };

        Observable.combineLatest(
            CommonAdapter(this.patientService, 'id', patient => `<div class="flex-row"><div class="flex-col-50 align-left">${patient.firstName} ${patient.lastName}</div><div class="flex-col-50 align-right">${PatientService.formatPatientMedicalId(patient.medicalStateId)}</div>`),
            CommonAdapter(this.caregiverService, 'id', caregiver => `<div class="flex-row"><div class="flex-col-50 align-left">${caregiver.firstName} ${caregiver.lastName}</div><div class="flex-col-50 align-right">${CaregiverService.formatCaregiverMedicalId(caregiver.medicalStateId)}</div>`),
            CommonAdapter(this.physicianService, 'id', physician => `${physician.firstName} ${physician.lastName}` ),
            CommonAdapter(this.patientGroupService, 'id', 'name')
        ).toPromise()
            .then(([PatientAdapter, CaregiverAdapter, PhysicianAdapter, PatientGroupAdapter]) => {

                this.patientSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Patient to Add'
                };
                this.patientSelect2Options['dataAdapter'] = PatientAdapter;

                this.physicianSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Physician'
                };
                this.physicianSelect2Options['dataAdapter'] = PhysicianAdapter;

                this.patientGroupSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Patient Group'
                };
                this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;

                this.caregiverSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Caregiver to Add'
                };
                this.caregiverSelect2Options['dataAdapter'] = CaregiverAdapter;
            });

        this.medicalConditionsSelect2Options = {
            multiple: true,
            data: this.patientService.patientMedicalConditions.map(condition => {
                return {id: condition, text: condition}
            }),
            placeholder: "Select a medical condition..."
        };

        //Handle the situation where we have subscribed to the verification observable but the dialog is closed instead of the user choosing to verify or add to queue
        this.verifyAddModalShowingSubscription = this.patientService.verifyAddModalShowing.subscribe(showing => {

            if(!showing) {
                if(this.verificationSubscription && !this.verificationSubscription.closed){
                    this.unsubscribeVerification();
                }
            }
        })
    }

    ngOnDestroy(){
        this.selectedPatientId = null;
        this.selectedCaregiverId = null;
        this.unsubscribeVerification();
        this.verifyAddModalShowingSubscription.unsubscribe();
    }

    newCondition(){
        this.addingNewCondition = true;
        this.patient.patientMedicalConditions = [];
    }

    newPhysician(){
        this.addingNewPhysician = true;
        this.patient.physicianId = undefined;
    }

    backToPredefinedConditions(){
        this.addingNewCondition = false;
        // If it's empty Select2 will select ALL options
        this.patient.patientMedicalConditions = null;
    }

    showConfirmation(){
        this.showConfirm = true;
        this.showAdd = false;
    }

    saveAndAdd() {
        this.save().then((valid) => {
            if(valid) {
                this.clearErrors();

                this.showVerifyModal();
            }
        });
    }

    backToPredefinedPhysicians(){
        this.addingNewPhysician = false;
        this.newPhysicianObject = this.physicianService.newInstance();
    }

    showVerifyModal(){

        this.patientService.showVerifyAddModal();
        this.verificationSubscription = this.patientService.verifiedEmitted.subscribe((verified) => {

            this.unsubscribeVerification();

            console.log("Verified emitted!");

            //Create patient queue record
            const now = this.timeZone ? moment().tz(this.timeZone).utc().format() : moment().utc().format();
            this.patientQueueService.addToQueue(this.patient.id, this.caregiver ? this.caregiver.id : null, verified ? now : null, this.store.id, 'desktop').then(result => {
                console.log(result);
                this.patientQueueService.viewQueue();
            }) .catch(err => {
                console.log(err);
                this.errorMessage = err.message;
            });
        });
    }

    unsubscribeVerification(){
        this.verificationSubscription && this.verificationSubscription.unsubscribe();
    }

    clearErrors() {
        this.errorMessage = "";
        this.errors = [];
        this.clearErrorFlags();
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    async save():Promise<boolean>{

        let physicianSave;

        this.clearErrorFlags();
        let errors = [];

        if(!this.patient.firstName) {
            errors.push("First Name is a required field.");
            this.errorFlags.firstName = true;
        }
        if(!this.patient.lastName) {
            errors.push("Last Name is a required field.");
            this.errorFlags.lastName = true;
        }
        if(!this.patient.patientType) {
            errors.push("Patient Type is a required field.");
            this.errorFlags.patientType = true;
        }
        if(!this.patient.patientGroupId) {
            errors.push("Patient Group is a required field.");
            this.errorFlags.patientGroupId = true;
        }
        if(!this.patient.medicalStateId) {
            errors.push("Medical / State ID is a required field.");
            this.errorFlags.medicalStateId = true;
        } else if(!this.patientService.validateMedicalStateId(this.patient.medicalStateId)) {
            errors.push("Enter a valid medical / state id.");
            this.errorFlags.medicalStateId = true;
        }
        if(this.patient.gramLimit !== 0 && !this.patient.gramLimit){
            errors.push("You must set a patient's gram limit every time they check in.");
            this.errorFlags.gramLimit = true;
        }

        if(!this.patient.expirationDate && environment.shouldShowPatientIDExpiration) {
            errors.push("Expiration Date is a required field.");
            this.errorFlags.expirationDate = true;
        }

        if(!this.patient.driversLicenseId && !this.patient.passportId && !this.patient.otherStateId) {
            errors.push("At least one of Driver's License ID, Passport ID or Other State ID is a required.");

            this.errorFlags.driversLicenseId = true;

            this.errorFlags.passportId = true;

            this.errorFlags.otherStateId = true;
        }

        //Check all unique IDs are unique
        if(this.patient.driversLicenseId || this.patient.passportId || this.patient.otherStateId){
            let ids = {};
            ids['medicalStateId'] = this.patient.medicalStateId;
            if(this.patient.driversLicenseId){
                ids['driversLicenseId'] = this.patient.driversLicenseId;
            }
            if(this.patient.passportId){
                ids['passportId'] = this.patient.passportId;
            }
            if(this.patient.otherStateId){
                ids['otherStateId'] = this.patient.otherStateId;
            }
            if(this.patient.emailAddress){
                ids['emailAddress'] = this.patient.emailAddress;
            }

            let result = await this.patientService.validateUniqueIds(ids, this.patient.id);

            console.log("Received result from validate unique ids");
            console.log(result);

            if(!result.unique){

                for(let id of Object.keys(result.nonUniqueFields)){
                    let idName = result.nonUniqueFields[id];
                    errors.push(`${idName} must be unique. This value already exists for another patient`);
                    this.errorFlags[id] = true;
                }
            }
        }

        if(!this.patient.county) {
            errors.push("County is a required field.");
            this.errorFlags.county = true;
        }

        if (this.environment.requirePatientAddress) {
            if(!this.patient.city) {
                errors.push("City is a required field.");
                this.errorFlags.city = true;
            }

            if(!this.patient.state) {
                errors.push("State is a required field.");
                this.errorFlags.state = true;
            }

            if(!this.patient.address) {
                errors.push("Address is a required field.");
                this.errorFlags.address = true;
            }

            if(!this.patient.zip) {
                errors.push("Zipcode is a required field.");
                this.errorFlags.zip = true;
            } else if(this.patient.zip.length != 5){
                errors.push("Enter a valid zipcode.");
                this.errorFlags.zip = true;
            }
        }

        if(!this.patient.birthday) {
            errors.push("Birthday is a required field.");
            this.errorFlags.birthday = true;
        }

        if(!this.patient.phoneNumber && !this.patient.emailAddress) {
            errors.push("At least one of Phone Number or Email Address is a required.");
            this.errorFlags.phoneNumber = true;

            this.errorFlags.emailAddress = true;
        }

        if(this.patient.phoneNumber && this.patient.phoneNumber.length > 10) {
            errors.push("Phone Number cannot exceed 10 digits.");
            this.errorFlags.phoneNumber = true;
        }

        if(this.patient.emailAddress && !(await this.patientService.validateEmail(this.patient.emailAddress))) {
            errors.push("Enter a valid email address.");
            this.errorFlags.emailAddress = true;
        }

        if(!this.patient.patientMedicalConditions && !this.patient.patientMedicalConditions) {
            errors.push("Medical Condition is a required field.");
            this.errorFlags.patientMedicalConditions = true;
        }

        if (this.environment.requirePatientReferrer && !this.patient.referrer) {
            errors.push("Enter a valid referrer.");
            this.errorFlags.referrer = true;
        }

        if (this.caregiver && (!this.caregiver.firstName || !this.caregiver.lastName)) {
            if(!this.caregiver.firstName){
                this.errorFlags.caregiverFirstName = true;
            }
            if(!this.caregiver.lastName) {
                this.errorFlags.caregiverLastName = true;
            }
            errors.push("You must enter Caregiver first and last names");
            //Note: Anywhere this save function exits without closing the modal, the verification subscription needs to be unsubscribed
        }

        if(this.caregiver && (!this.caregiver.phoneNumber && !this.caregiver.emailAddress)) {
            this.errorFlags.caregiverPhoneNumber = true;
            this.errorFlags.caregiverEmail = true;
            errors.push("At least one of Caregiver Phone Number or Email Address is required");
        }

        if(this.caregiver && !this.caregiver.birthday) {
            this.errorFlags.caregiverBirthday = true;
            errors.push("Caregiver birthday is a required field.");
        }

        if (!this.patient.physicianId &&
            (!this.newPhysicianObject.firstName || !this.newPhysicianObject.lastName || !this.newPhysicianObject.clinicName)) {

            if(!this.newPhysicianObject.firstName){
                this.errorFlags.physicianFirstName = true;
            }
            if(!this.newPhysicianObject.lastName){
                this.errorFlags.physicianLastName = true;
            }
            if(!this.newPhysicianObject.clinicName){
                this.errorFlags.physicianClinicName = true;
            }

            errors.push("You must enter Physician information");
            //Note: Anywhere this save function exits without closing the modal, the verification subscription needs to be unsubscribed
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;

            return false;
        }

        if (!this.patient.physicianId && this.newPhysicianObject.firstName) {
            console.log("Saving physician", this.newPhysicianObject);

            physicianSave = new Promise(resolve => {
                this.physicianService.save(this.newPhysicianObject, false, () => {
                    this.patient.physicianId = this.newPhysicianObject.id;
                    resolve();
                });
            })
        } else {
            physicianSave = new Promise(resolve => setTimeout(resolve, 1));
        }

        return new Promise<boolean>(
            (resolve,reject) => {

                physicianSave.then(() => {

                    console.log("Saving patient", this.patient);

                    this.patientService.save(this.patient, false, () => {

                        //First things first, save caregiver
                        if(this.caregiver){
                            this.caregiver.medicalStateId = this.caregiver.medicalStateId.replace(/[^a-zA-Z0-9]/g, '');
                            this.caregiverService.save(this.caregiver);
                        }

                        this.newPhysicianObject = this.physicianService.newInstance();

                        resolve(true)

                    });
                });
            }
        );
    }

    cancel(){
        this.patient.gramLimit = this.oldGramLimit;
        this.patientQueueService.viewQueue();
        this.newPhysicianObject = this.physicianService.newInstance();
    }

    searchMedicalID(){

        this.caregiverService.getByMedicalId(this.caregiverMedicalID.replace(/[^a-zA-Z0-9]/g, '')).subscribe(caregiver => {
            console.log("Caregiver received");
            console.log(caregiver);
            if(!caregiver){
                this.caregiver = this.caregiverService.newInstance();
                this.caregiver.medicalStateId = this.caregiverMedicalID;
                this.searchMessage = "No caregiver with this ID found. Please register a new one.";
                this.searchError = true;
            }else{
                this.searchMessage = "Caregiver found! Confirm details below."
                this.caregiver = caregiver;
                this.searchError = false;
            }

        });
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

    formatBirthday(birthday){

        return moment(birthday).format("MM/DD/YYYY");

    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }

    formatMedIDFromEvent(event: any){

        event.target.value = PatientService.formatPatientMedicalId(event.target.value);

    }

    setMedicalStateId(medicalStateId: string) {
        var alphanumericOnlyMedId = medicalStateId.replace(/[^a-zA-Z0-9]+/g, '');

        this.patient.medicalStateId = alphanumericOnlyMedId;
    }

    setPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.patient.phoneNumber = numbersOnlyPhoneNumber;
    }


    setPhysicianPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.newPhysicianObject.phoneNumber = numbersOnlyPhoneNumber;
    }


    setCaregiverMedicalId(medicalStateId: string) {
        var alphanumericOnlyMedId = medicalStateId.replace(/[^a-zA-Z0-9]+/g, '');

        this.caregiverMedicalID = alphanumericOnlyMedId;
    }

    setCaregiverPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9\.]+/g, '');

        this.caregiver.phoneNumber = numbersOnlyPhoneNumber;
    }

    viewPurchaseHistory(){
        this.patientService.showPreviousPurchasesModal(this.patient, "Add to Queue");
    }

    viewPatientNotes(){
        this.patientService.showPatientNotesModal(this.patient, "Add to Queue");
    }

    filterNumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || key > 57) e.preventDefault();
    }

    filterAlphanumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || (key > 57 && key < 65 ) || (key > 90 && key < 97) || key > 122) e.preventDefault();
    }

    uploadImage($event: FileHolder, patient: IPatient, patientField = 'idImage') {
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

                patient[patientField] = decodeURIComponent($response.find('Location').text());

                this.patientService.save(patient, false, () => {
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

    setCaregiverFirst(caregiverId) {
        if(caregiverId !== null && caregiverId !== undefined) {
            this.caregiverSelectedFirst = true;
        }
    }

    setPatientFirst(patientId) {
        if(patientId !== null && patientId !== undefined) {
            this.caregiverSelectedFirst = false;
        }
    }

    returnToCheckIn(){
        this.selectedPatientId = null;
        this.selectedCaregiverId = null;
        this.caregiverSelectedFirst = false;
    }
}
