import {Component, Injector, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, Observable} from "rxjs";
import * as moment from 'moment-timezone';

import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {didSet} from "../../../lib/decorators/property/didSet";

import {PatientService} from "../../../services/patient.service";
import {PatientQueueService} from "../../../services/patient-queue.service";
import {StoreService} from "../../../services/store.service";
import {IPatient} from "../../../models/interfaces/patient.interface";
import {IPatientQueue} from "../../../models/interfaces/patient-queue.interface";
import {IUser} from "../../../models/interfaces/user.interface";
import {UserService} from "../../../services/user.service";

import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetType(newValue){
    this.toggleTypeSource.next(newValue);
}

@Component({
    selector: 'app-patients-queue',
    templateUrl: './check-in-index.component.html',
    styleUrls: ['./check-in-index.component.css']
})
export class CheckInComponent extends ObjectsIndexComponent<IPatientQueue> implements OnInit {

    typeOptions = [
        {
            label: 'Queue',
            value: 'queue'
        },
        {
            label: 'Entered',
            value: 'entered'
        }
    ];

    @didSet(didSetType) type: 'queue'| 'entered';
    toggleTypeSource: BehaviorSubject<string> = new BehaviorSubject(this.type);

    sort: SortBy = new SortBy( 'updatedAt', 'desc' );
    timeZone: string;

    date: string;

    customUploadStyle = {
        selectButton: {
            "background-color": "#18a9e2",
            "text-align": "center",
            "text-decoration": "none",
            "color": "#FFF",
            "outline": "none",
            "box-shadow": "none",
            "border": "none",
            "cursor": "pointer",
            "border-radius": "4px",
            "padding": "8px 14px",
            "font-size": "inherit",
            "text-transform": "none"
        },
        layout: {
            "padding" : "0"
        }
    };

    isPreviousPurchasesModalShowing: boolean = false;
    isReleaseBudtenderModalShowing: boolean = false;

    user: IUser;

    constructor(injector: Injector, private patientQueueService: PatientQueueService, private patientService: PatientService,
                private storeService: StoreService, private previousRouteService: PreviousRouteService, userService: UserService) {
        super(injector, patientQueueService);

        this.userService.userEmitted.subscribe(user => {
            this.user = user;

            if (!this.user.Permissions.canDoPatientCheck) {
                this.patientQueueService.backToDash();
            }
        });
    }

    ngOnInit() {

        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/patients/check-in");

        this.extraFilters.next({queueType: this.type, sortBy: this.sort})
        super.ngOnInit();

        this.toggleTypeSource.subscribe(queueType => {
            this.extraFilters.next({queueType, sortBy: this.sort})
        })

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.timeZone = store.timeZone;
            this.date = moment().tz(this.timeZone).format("MM/DD/YYYY");
        });

        this.patientService.previousPurchasesModalShowing.subscribe(val => {
            this.isPreviousPurchasesModalShowing = val;
        });

        this.patientQueueService.releaseBudtenderModalShowing.subscribe(val => {
            this.isReleaseBudtenderModalShowing = val;
        });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.type = 'queue';
        }
        this.toggleTypeSource.next(this.type);
    }

    onRowClick(event, patient: IPatient) {

        let target = $(event.target);

        //Last two checks are for upload image button, event is fired from both span and input
        if (target.is('i') || target.is('button') || target.is('span') || target.is('input') || target.is('label') || target.is('a')) {
            return;
        }

        this.patientService.showPatientCheckInModal(patient);
    }

    verifyOrEnter(patientQueue: IPatientQueue){
        console.log("Verify clicked!");
        if(!patientQueue.verifiedAt){
            this.patientService.showPatientCheckInModal(patientQueue.Patient);
        }else if(!patientQueue.enteredAt){
            patientQueue.enteredAt = moment().tz(this.timeZone).utc();
            this.patientQueueService.save(patientQueue, false);
        }

    }

    remove(patientQueue: IPatientQueue){
        this.patientQueueService.remove(patientQueue.id);
    }

    addToQueue(){
        this.patientQueueService.add();
    }

    viewQueue(){
        this.patientQueueService.viewQueue();
    }

    viewPurchaseHistory(patient: IPatient){
        this.patientService.showPreviousPurchasesModal(patient, 'Patient Check In');
    }

    verifyAndEnter(patientQueue: IPatientQueue) {
        const now = moment().tz(this.timeZone).utc()
        patientQueue.verifiedAt = now
        patientQueue.enteredAt = now
        this.patientQueueService.save(patientQueue, this.search.bind(this) )
    }

    hasId(patient: IPatient) {
      return Boolean(patient.driversLicenseId || patient.passportId || patient.otherStateId)
    }

    openUrl(url: string){
        window.open(url, "_blank");
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }

    viewBudtender(patientQueue){
        this.patientQueueService.showReleaseBudtenderModal(patientQueue, "Patient Check In");
    }
}
