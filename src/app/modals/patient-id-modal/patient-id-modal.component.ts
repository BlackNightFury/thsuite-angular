import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {IPatient} from "../../models/interfaces/patient.interface";
import {Http} from "@angular/http";
import {PatientService} from "../../services/patient.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
declare const $: any;

@Component({
    selector: "app-patient-id-modal",
    templateUrl: './patient-id-modal.component.html',
    styleUrls: ['./patient-id-modal.component.css']
})
export class PatientIDModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    patient: IPatient;
    modalSubscription: Subscription;
    patientSubscription: Subscription;

    source: string; //Top level breadcrumb

    constructor(
        private element: ElementRef,
        private http: Http,
        private patientService: PatientService
    ){

    }

    ngOnInit(){

        this.modalSubscription = this.patientService.patientIDModalPatient.subscribe(data => {
            let {patientId, source} = data;
            this.source = source;

            this.patientSubscription = this.patientService.getAssociated(patientId).subscribe(patient => {
                console.log(patient);
                
                this.patient = patient;
            });
        })
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Patient ID",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 1000,
                classes: {
                    "ui-dialog": "patient-id"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {

                    this.patientService.hidePatientIDModal();
                },
                open: function(){
                    jQuery('.ui-widget-overlay').bind('click',function(){
                        $dialog.dialog('close');
                    })
                }
            });

        this.dialog = $dialog;
    }

    close(){
        this.dialog.dialog('close');
    }

    ngOnDestroy() {
        
        if(this.modalSubscription) {
            this.modalSubscription.unsubscribe();
        }

        if(this.patientSubscription) {
            this.patientSubscription.unsubscribe();
        }
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }
}

