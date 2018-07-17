import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {IPatientQueue} from "../../models/interfaces/patient-queue.interface";
import {PatientQueueService} from "../../services/patient-queue.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
declare const $: any;

@Component({
    selector: "app-release-budtender-modal",
    templateUrl: './release-budtender-modal.component.html',
    styleUrls: ['./release-budtender-modal.component.css']
})
export class ReleaseBudtenderModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    patientQueue: IPatientQueue;
    modalSubscription: Subscription;

    source: string; //Top level breadcrumb

    constructor(
        private element: ElementRef,
        private patientQueueService: PatientQueueService
    ){

    }

    ngOnInit(){

        this.modalSubscription = this.patientQueueService.releaseBudtenderModalPatientQueue.subscribe(data => {
            let {patientQueue, source} = data;
            this.source = source;

            this.patientQueue = patientQueue;
        })
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 1000,
                classes: {
                    "ui-dialog": "release-budtender"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {

                    this.patientQueueService.hideReleaseBudtenderModal();
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
    }

    yes() {
        if(this.patientQueue && this.patientQueue.budtenderId) {
            this.patientQueueService.releaseBudtender(this.patientQueue);
            this.dialog.dialog('close');
        }
    }

    no() {
        this.dialog.dialog('close');
    }
}

