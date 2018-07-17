import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";

import * as uuid from "uuid";

import {IStore} from "../models/interfaces/store.interface";
import {Store} from "../models/store.model";

import "rxjs/add/operator/toPromise";
import {SocketService} from "../lib/socket";
import {CommonService} from "./common.service";
import {Router} from "@angular/router";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPatientGroup} from "../models/interfaces/patient-group.interface";
import {PatientGroup} from "../models/patient-group.model";
import {IPatient} from "../models/interfaces/patient.interface";
import {Patient} from "../models/patient.model";
import {SortBy} from "app/util/directives/sort-table-header.directive";
import {ObjectObservable} from "../lib/object-observable";
import {PatientGroupService} from "./patient-group.service";
import {PosCartService} from "./pos-cart.service";
import {PhysicianService} from "./physician.service";
import {PatientCartWithStart} from "../pos/pos-patient-queue/patient-cart-with-start";
import {environment} from "../../environments/environment";
import {PatientNoteService} from "app/services/patient-note.service";
import {IPatientNote} from "../models/interfaces/patient-note.interface";

declare const $ : any;

@Injectable()
@Mixin([SearchableService])
export class PatientService extends CommonService<IPatient> implements SearchableService<IPatient> {

    protected emitRefundInitiatedSource = new BehaviorSubject<PatientCartWithStart>(undefined);
    refundInitiated = this.emitRefundInitiatedSource.asObservable();

    protected emitCheckInModalShowingSource = new BehaviorSubject<boolean>(undefined);
    checkInModalShowing = this.emitCheckInModalShowingSource.asObservable();

    protected emitCheckInModalPatientSource = new BehaviorSubject<string>(undefined);
    checkInModalPatient = this.emitCheckInModalPatientSource.asObservable();

    protected emitVerifyAddModalShowingSource = new BehaviorSubject<boolean>(undefined);
    verifyAddModalShowing = this.emitVerifyAddModalShowingSource.asObservable();

    protected emitVerifiedSource = new Subject<boolean>();
    verifiedEmitted = this.emitVerifiedSource.asObservable();

    protected emitPreviousPurchasesModalShowingSource = new BehaviorSubject<boolean>(undefined);
    previousPurchasesModalShowing = this.emitPreviousPurchasesModalShowingSource.asObservable();

    protected emitPreviousPurchasesModalPatientSource = new BehaviorSubject<any>(undefined);
    previousPurchasesModalPatient = this.emitPreviousPurchasesModalPatientSource.asObservable();

    protected emitPatientIDModalShowingSource = new BehaviorSubject<boolean>(undefined);
    patientIDModalShowing = this.emitPatientIDModalShowingSource.asObservable();

    protected emitPatientIDModalPatientSource = new BehaviorSubject<any>(undefined);
    patientIDModalPatient = this.emitPatientIDModalPatientSource.asObservable();

    protected emitPatientNotesModalShowingSource = new BehaviorSubject<boolean>(undefined);
    patientNotesModalShowing = this.emitPatientNotesModalShowingSource.asObservable();

    protected emitPatientNotesModalPatientSource = new BehaviorSubject<any>(undefined);
    patientNotesModalPatient = this.emitPatientNotesModalPatientSource.asObservable();

    //TODO: Turn into environment variable when more med states come online
    public patientMedicalConditions = [
        "Cachexia",
        "Anorexia",
        "Wasting syndrome",
        "Severe pain",
        "Severe nausea",
        "Seizures",
        "Severe/persistent muscle spasms",
        "Glaucoma",
        "Chronic pain",
        "PTSD"
    ];

    constructor(injector: Injector, private patientGroupService: PatientGroupService, private physicianService: PhysicianService, private patientNoteService: PatientNoteService) {
        super(injector, 'patients');

    }


    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IPatient>>;

    newInstance() {
        return new Patient({
            id: uuid.v4(),
            version: 0,

            firstName: '',
            lastName: '',

            patientType: 'medical',

            patientGroupId: null,

            medicalStateId: '',
            expirationDate: null,
            birthday: null,
            phoneNumber: '',
            emailAddress: '',

            zip: '',
            county: '',
            address: '',
            city: '',
            state: '',

            gramLimit: 0,
            patientMedicalConditions: [],
            patientNotes: '',

            driversLicenseId: '',
            passportId: '',
            otherStateId: '',

            loyaltyPoints: 0,
            amountRemaining: 0,
            physicianId: '',
            idImage: '',
            attestationForm: '',
            firstTimeInQueue: null,
            lastAddedToQueue: null,

            referrer: null
        });
    }

   dbInstance(fromDb: IPatient) {
        if (!fromDb.patientMedicalConditions || !fromDb.patientMedicalConditions.length) {
            fromDb.patientMedicalConditions = null;
        }

        return new Patient(fromDb);
    }

    instanceForSocket(object: IPatient) {
        return {
            id: object.id,
            version: object.version,

            firstName: object.firstName,
            lastName: object.lastName,

            patientType: object.patientType,
            patientGroupId: object.patientGroupId,
            medicalStateId: object.medicalStateId,
            expirationDate: (object.expirationDate ? object.expirationDate.toString() : null),
            birthday: (object.birthday ? object.birthday.toString() : null),
            phoneNumber: object.phoneNumber,
            emailAddress: object.emailAddress,

            zip: object.zip,
            county: object.county,
            address: object.address,
            city: object.city,
            state: object.state,

            gramLimit: object.gramLimit,
            patientMedicalConditions: Array.isArray(object.patientMedicalConditions) ? object.patientMedicalConditions : [object.patientMedicalConditions],
            patientNotes: object.patientNotes,

            loyaltyPoints: object.loyaltyPoints,

            driversLicenseId: object.driversLicenseId,
            passportId: object.passportId,
            otherStateId: object.otherStateId,

            amountRemaining: 0,
            physicianId: object.physicianId,
            idImage: object.idImage,
            attestationForm: object.attestationForm,
            firstTimeInQueue: object.firstTimeInQueue,
            lastAddedToQueue: object.lastAddedToQueue,

            referrer: object.referrer
        }
    }

    resolveAssociations(patient: IPatient, scopes: Array<string> = ['patientGroup', 'physician', 'patientNote']): ObjectObservable<IPatient> {

        const scopeResolvers = {
            'patientGroup' : {
                'PatientGroup': () => patient.patientGroupId ? this.patientGroupService.get(patient.patientGroupId) : Observable.of(undefined)
            },
            'phsyician' : {
                'Physician': () => patient.physicianId ? this.physicianService.get(patient.physicianId) : Observable.of(undefined)
            },
            'patientNote': {
                'PatientNotes': () => {
                    return Observable.combineLatest(
                        this.patientNoteService.getByPatientId(patient.id)
                    ).switchMap(([noteObservables]) => {
                        if(noteObservables.length){
                            return Observable.combineLatest(noteObservables, (...notes: IPatientNote[]) => {
                                return notes;
                            });
                        }else{
                            return Observable.of([]);
                        }
                    })
                }
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if(scopesToResolve.length < 1){
            return new ObjectObservable(Observable.of(patient), patient.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(patient, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, patient.id);


        // let obs = Observable.combineLatest(
        //     patient.patientGroupId ? this.patientGroupService.get(patient.patientGroupId) : Observable.of(undefined),
        //     patient.physicianId ? this.physicianService.get(patient.physicianId) : Observable.of(undefined),
        // ).map(([patientGroup,physician]) => {
        //
        //     patient.PatientGroup = patientGroup;
        //     patient.Physician = physician;
        //
        //     return patient
        // });
        //
        // return new ObjectObservable(obs, patient.id);

    }

    remove(patient: IPatient): Promise<void> {

        return this.socket.emitPromise('remove', patient.id)
            .then(() => {
                this.router.navigate(['admin', 'patients', 'index']);
            });

    }

    findByIdentifier(identifier: string): Observable<IPatient> {

        let subject = new Subject<IPatient>();

        this.socket.emitPromise('findByIdentifier', {identifier})
            .then(patientId => {
                if(patientId) {
                    this.getAssociated(patientId)
                        .subscribe(subject);
                }else{
                    subject.next(patientId);
                }
            });

        return subject.asObservable();
    }

    exportPatients() {
        return this.socket.emitPromise('export');
    }

    validateEmail(email: string): Promise<boolean> {
        if(!email.match(/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)){
            return Promise.resolve(false);
        }

        return this.socket.emitPromise('validateEmail', {email})
    }

    validateMedicalStateId(medicalStateId: string) {
        return (medicalStateId.length == 16);
    }

    validateUniqueIds(ids: any, patientId: string){
        return this.socket.emitPromise('validateUniqueIds', {ids, patientId});
    }

    create() {
        this.router.navigate(['admin', 'patients', 'index', 'add']);
    }

    edit(object: IPatient) {
        this.router.navigate(['admin', 'patients', 'index', 'edit', object.id]);
    }

    view(object: IPatient) {
        this.router.navigate(['admin', 'patients', 'index', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'patients', 'index']);
    }

    cancelEdit(store: IPatient) {
        this.router.navigate(['admin', 'patients', 'index']);
    }

    save(object: IPatient, navigateToIndex: boolean = true, callback?: Function) {

        if (!Array.isArray(object.patientMedicalConditions)) {
           object.patientMedicalConditions = [object.patientMedicalConditions];
        }

        super.save(object, callback);

        if(navigateToIndex) {
            this.router.navigate(['admin', 'patients', 'index']);
        }
    }

    setGramLimit(patientId: string, gramLimit: number, callback?: Function){

        this.socket.emitPromise('setGramLimit', {patientId, gramLimit}).then(response => {
            if(response){
                $.notify('Patient Gram Limit Updated', 'success');
            }else{
                $.notify('Unable to update gram limit', 'error')
            }

            callback && callback(response);
        });

    }

    setMedicalId(patientId: string, medicalId: string, callback?: Function){
        this.socket.emitPromise('setMedicalId', {patientId, medicalId}).then(response => {
            if(response){
                $.notify('Patient Medical ID Updated', 'success');
            }else{
                $.notify('Unable to update medical ID', 'error');
            }

            callback && callback(response);

        })
    }

    initiateRefund(newPatient: PatientCartWithStart) {
       this.emitRefundInitiatedSource.next(newPatient);
       this.router.navigate(['pos', 'all'])
    }

    clearInitiatedRefund(){
        this.emitRefundInitiatedSource.next(null);
    }

    showPatientCheckInModal(patient: IPatient){
        this.emitCheckInModalPatientSource.next(patient.id);
        this.emitCheckInModalShowingSource.next(true);
    }

    hidePatientCheckInModal(){
        this.emitCheckInModalShowingSource.next(false);
    }

    showVerifyAddModal(){
        this.emitVerifyAddModalShowingSource.next(true);
    }

    hideVerifyAddModal(){
        this.emitVerifyAddModalShowingSource.next(false);
    }

    confirmVerified(){
        this.emitVerifiedSource.next(true);
    }

    confirmNotVerified(){
        this.emitVerifiedSource.next(false);
    }

    showPreviousPurchasesModal(patient: IPatient, source: string){
    this.emitPreviousPurchasesModalPatientSource.next({patientId: patient.id, source: source});
    this.emitPreviousPurchasesModalShowingSource.next(true);
}

    hidePreviousPurchasesModal(){
        this.emitPreviousPurchasesModalShowingSource.next(false);
    }

    showPatientNotesModal(patient: IPatient, source: string){
        this.emitPatientNotesModalPatientSource.next({patientId: patient.id, source: source});
        this.emitPatientNotesModalShowingSource.next(true);
    }

    hidePatientNotesModal(){
        this.emitPatientNotesModalShowingSource.next(false);
    }

    showPatientIDModal(patient: IPatient, source: string){
        this.emitPatientIDModalPatientSource.next({patientId: patient.id, source: source});
        this.emitPatientIDModalShowingSource.next(true);
    }

    hidePatientIDModal(){
        this.emitPatientIDModalShowingSource.next(false);
    }

    getUploadParams(contentType: string): Promise<any> {
        return this.socket.emitPromise('get-s3-upload-params', {contentType});
    }

    static formatPatientMedicalId(id: string){

        let value = id.replace(/[^a-zA-Z0-9]/g, '');

        let regex = new RegExp(environment.medicalIdRegex, 'g');

        if(!value.match(regex)){
            return value;
        }

        return value.match(regex).join(environment.medicalIdSeparator);

    }
}
