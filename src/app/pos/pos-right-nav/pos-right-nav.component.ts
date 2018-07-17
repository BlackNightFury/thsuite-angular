import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {IPatient} from "../../models/interfaces/patient.interface";
import {Patient} from "../../models/patient.model";
import {PatientService} from "../../services/patient.service";
import {PatientCartWithStart} from "../pos-patient-queue/patient-cart-with-start";
import {PatientQueueService} from "../../services/patient-queue.service";
import {Observable} from "rxjs/Observable";
import {Cart} from "../../models/cart.model";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";
import {Subscription} from "rxjs/Subscription";


@Component({
    selector: 'app-pos-right-nav',
    templateUrl: './pos-right-nav.component.html'
})
export class PosRightNavComponent implements OnInit {

    patientList: PatientCartWithStart[] = [];

    selectedPatient: PatientCartWithStart;

    userSubscription: Subscription;
    user: IUser;

    constructor(private patientService: PatientService, private patientQueueService: PatientQueueService, private userService: UserService) {
        this.patientService.refundInitiated.take(1).subscribe( patient => {
            console.log("REFUND INITIATED EMITTED");
            if(patient) {
                this.newPatient(patient);
            }

            this.patientService.clearInitiatedRefund();
        } )
    }

    ngOnInit() {

      this.userSubscription = this.userService.userEmitted
        .subscribe(user => {
            this.user = user;
        });

        //Get patients in queue
        this.patientQueueService.refreshEmitted.subscribe(() => {
            console.log("Refresh emitted in right nav!");
            this.getPatientQueue();
        });

        this.getPatientQueue();

    }

    getPatientQueue(){
        this.patientQueueService.getAll().take(1).subscribe(patientQueues => {
            console.log("getAll resolve");
            console.log(patientQueues);
            Observable.combineLatest(patientQueues).subscribe(queues => {
                let patientList = [];
                queues.forEach(queue => {
                    if(queue.enteredAt && (!queue.cartOpen || (queue.budtenderId && queue.budtenderId === this.user.id))){
                        let patientWithCart = {
                            patient: queue.Patient,
                            cart: new Cart(),
                            startTime: queue.enteredAt,
                            caregiver: queue.caregiverId ? queue.Caregiver : undefined,
                            patientQueueId: queue.id,
                            budtenderId: null
                        };

                        patientList.push(patientWithCart);
                    }
                });

                this.patientList = patientList;
            })
        });
    }

    selectPatient(patient: PatientCartWithStart) {
        this.selectedPatient = patient;
    }

    newPatient(patient: PatientCartWithStart) {
        this.patientList.push(patient);
        this.patientList = this.patientList.slice();

        this.selectPatient(patient);
    }

    clearSelectedPatient() {
        this.patientQueueService.markCartStatus(this.selectedPatient.patient.id, false);
        this.selectedPatient = undefined;
    }

    removeSelectedPatient() {

        let newList = [];

        for(let patientWithCart of this.patientList){
            if(this.selectedPatient.patient.id != patientWithCart.patient.id){
                newList.push(patientWithCart);
            }
        }

        this.patientList = newList.slice();

        this.patientQueueService.markCartStatus(this.selectedPatient.patient.id, false);

        this.selectedPatient = undefined;

        // console.log(this.patientList);
        // let selectedIndex = this.patientList.indexOf(this.selectedPatient);
        //
        // console.log(selectedIndex);
        //
        // this.patientList.splice(selectedIndex, 1);
        // this.patientList = this.patientList.slice();
        //
        // this.selectedPatient = undefined;
    }
}
