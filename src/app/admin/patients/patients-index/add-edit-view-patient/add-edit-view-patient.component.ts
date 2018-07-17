import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IDiscount} from "../../../../models/interfaces/discount.interface";
import {DiscountService} from "../../../../services/discount.service";
import {Discount} from "../../../../models/discount.model";
import {ProductTypeService} from "../../../../services/product-type.service";
import {IProductType} from "../../../../models/interfaces/product-type.interface";
import {ActivatedRoute} from "@angular/router";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PackageService} from "../../../../services/package.service";
import {ProductService} from "../../../../services/product.service";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {PatientGroupService} from "../../../../services/patient-group.service";
import {PatientService} from "../../../../services/patient.service";
import {PhysicianService} from "../../../../services/physician.service";
import {CountyService} from "../../../../services/county.service";
import {IPatient} from "../../../../models/interfaces/patient.interface";
import {IPatientGroup} from "../../../../models/interfaces/patient-group.interface";
import {Patient} from "../../../../models/patient.model";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {Http} from "@angular/http";
import * as moment from 'moment';
import {PatientNoteService} from "../../../../services/patient-note.service";
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-add-edit-view-patient',
    templateUrl: './add-edit-view-patient.component.html',
    styleUrls: ['./add-edit-view-patient.component.css']
})
export class AddEditViewPatientComponent extends AddEditViewObjectComponent<IPatient> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;
    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;
    @ViewChild('birthdayInput')birthdayInput : ElementRef;

    environment = environment;

    minExpDate: Date = new Date();
    maxBirthday: Date = moment().subtract(18, 'years').toDate();

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
        address: false,
        city: false,
        state: false,
        zip: false,
        emailAddress: false,
        patientMedicalConditions: false,
        referrer: false
    };

    countySelect2Options: Select2Options;
    patientGroupSelect2Options: Select2Options;
    physicianSelect2Options: Select2Options;
    medicalConditionsSelect2Options: Select2Options;
    addingNewCondition: boolean = false;

    initialPatientNote: string;

    constructor(
      injector: Injector,
      private patientService: PatientService,
      private patientGroupService: PatientGroupService,
      private physicianService: PhysicianService,
      private patientNoteService: PatientNoteService,
      private countyService: CountyService,
      private http: Http,
      private loadingBarService: SlimLoadingBarService
    ) {
        super(injector, patientService);
    }

    ngOnInit() {
        super.ngOnInit();

        this.countySelect2Options = {
            data: this.countyService.counties
        };

        CommonAdapter(this.patientGroupService, 'id', 'name')
            .then(PatientGroupAdapter => {

                this.patientGroupSelect2Options = {
                    ajax: {}
                };
                this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;
            });

        CommonAdapter(this.physicianService, 'id', physician => `${physician.firstName} ${physician.lastName}` )
            .then(PhysicianAdapter => {

                this.physicianSelect2Options = {
                    ajax: {}
                };
                this.physicianSelect2Options['dataAdapter'] = PhysicianAdapter;
            });

        this.medicalConditionsSelect2Options = {
            multiple: true,
            data: this.patientService.patientMedicalConditions.map(condition => {
                return {id: condition, text: condition}
            }),
            placeholder: "Select a medical condition..."
        }

        this.objectObservable.subscribe(object => {
            let predefinedConditions = this.patientService.patientMedicalConditions;
            if(this.object.patientMedicalConditions && this.object.patientMedicalConditions.length === 1 && predefinedConditions.indexOf(this.object.patientMedicalConditions[0]) == -1 && this.object.patientMedicalConditions[0]){
                this.addingNewCondition = true;
            }
        });

        if(this.object && this.object.physicianId && (!this.object.Physician || (this.object.Physician && this.object.Physician.id) ) ) {
            this.physicianService.get(this.object.physicianId).subscribe((physician) => {
                if(physician.id){
                    this.object.Physician = physician;
                }
            });
        }

    }


    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.patientService.edit(this.object);
    }

    viewPurchaseHistory(){
        this.patientService.showPreviousPurchasesModal(this.object, "Patient Dashboard");
    }

    viewPatientNotes(){
        this.patientService.showPatientNotesModal(this.object, "Patient Dashboard");
    }

    async save() {
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
        if(!this.object.patientType) {
            errors.push("Patient Type is a required field.");
            this.errorFlags.patientType = true;
        }
        if(!this.object.patientGroupId) {
            errors.push("Patient Group is a required field.");
            this.errorFlags.patientGroupId = true;
        }
        if(!this.object.medicalStateId) {
            errors.push("Medical / State ID is a required field.");
            this.errorFlags.medicalStateId = true;
        } else if(!this.patientService.validateMedicalStateId(this.object.medicalStateId)) {
            errors.push("Enter a valid medical / state id.");
            this.errorFlags.medicalStateId = true;
        }

        if(!this.object.expirationDate && environment.shouldShowPatientIDExpiration) {
            errors.push("Medical ID expiration Date is a required field.");
            this.errorFlags.expirationDate = true;
        }

        if(!this.object.driversLicenseId && !this.object.passportId && !this.object.otherStateId) {
            errors.push("At least one of Driver's License ID, Passport ID or Other State ID is a required.");

            this.errorFlags.driversLicenseId = true;

            this.errorFlags.passportId = true;

            this.errorFlags.otherStateId = true;
        }

        if(!this.object.county) {
            errors.push("County is a required field.");
            this.errorFlags.county = true;
        }

        if (this.environment.requirePatientAddress) {
            if(!this.object.city) {
                errors.push("City is a required field.");
                this.errorFlags.city = true;
            }

            if(!this.object.state) {
                errors.push("State is a required field.");
                this.errorFlags.state = true;
            }

            if(!this.object.address) {
                errors.push("Address is a required field.");
                this.errorFlags.address = true;
            }

            if(!this.object.zip) {
                errors.push("Zipcode is a required field.");
                this.errorFlags.zip = true;
            } else if(this.object.zip.length != 5){
                errors.push("Enter a valid zipcode.");
                this.errorFlags.zip = true;
            }
        }

        if(!this.object.birthday || new Date(this.object.birthday) > this.maxBirthday) {
            errors.push("Enter a valid birthday.");
            this.errorFlags.birthday = true;
        } else if(!this.birthdayInput.nativeElement.value.match(/(\d{2})\/(\d{2})\/(\d{4})$/)) {
            errors.push("Birthday must be in the format: mm/dd/yyyy.");
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

        //Check all unique IDs are unique
        if(this.object.medicalStateId || this.object.driversLicenseId || this.object.passportId || this.object.otherStateId){
            let ids = {};
            ids['medicalStateId'] = this.object.medicalStateId;
            if(this.object.driversLicenseId){
                ids['driversLicenseId'] = this.object.driversLicenseId;
            }
            if(this.object.passportId){
                ids['passportId'] = this.object.passportId;
            }
            if(this.object.otherStateId){
                ids['otherStateId'] = this.object.otherStateId;
            }
            if(this.object.emailAddress){
                ids['emailAddress'] = this.object.emailAddress;
            }

            let result = await this.patientService.validateUniqueIds(ids, this.object.id);

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

        if(!this.object.patientMedicalConditions && !this.object.patientMedicalConditions) {
            errors.push("Medical Condition is a required field.");
            this.errorFlags.patientMedicalConditions = true;
        }

        if (this.environment.requirePatientReferrer && !this.object.referrer) {
            errors.push("Referrer is a required field.");
            this.errorFlags.referrer = true;
        }


        if(!this.object.physicianId) {
            errors.push("Physician is a required field.");
            this.errorFlags.physicianId = true;
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.patientService.save(this.object, true, () =>{
            if(this.initialPatientNote){
                let note = this.patientNoteService.newInstance();
                note.patientId = this.object.id;
                note.authorId = this.user.id;
                note.Author = this.user;
                note.note = this.initialPatientNote;

                this.patientNoteService.save(note, () => {
                    if(!this.object.PatientNotes){
                        this.object.PatientNotes = [];
                    }
                    this.object.PatientNotes.unshift(note); //Add note to front
                })
            }
        });
    }

    cancel() {
        this.patientService.cancelEdit(this.object);
    }

    remove() {
        this.patientService.remove(this.object);
    }

    formatBirthday(birthday){

        return moment(birthday).format("M/DD/YYYY");

    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

    setPhoneNumber(phoneNumber: string) {
        var numbersOnlyPhoneNumber = phoneNumber.replace(/[^0-9]+/g, '');

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

    formatMedIDFromEvent(event: any){
        event.target.value = PatientService.formatPatientMedicalId(event.target.value);
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }

    newCondition(){
        this.addingNewCondition = true;
        this.object.patientMedicalConditions = [];
    }

    backToPredefinedConditions(){
        this.addingNewCondition = false;
        // If it's empty Select2 will select ALL options
        this.object.patientMedicalConditions = null;
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
}
