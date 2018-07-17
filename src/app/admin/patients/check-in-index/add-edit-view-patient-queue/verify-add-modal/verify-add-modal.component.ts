import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {PatientService} from "../../../../../services/patient.service";

declare const $: any;

@Component({
    selector: "app-verify-add-modal",
    templateUrl: './verify-add-modal.component.html',
    // styleUrls: ['./check-in-modal.component.css']
})
export class VerifyAddModalComponent implements OnInit, AfterViewInit{

    protected dialog;


    constructor(
        private element: ElementRef,
        private patientService: PatientService,
    ){

    }

    ngOnInit(){


    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 400,
                width: 600,
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.patientService.hideVerifyAddModal();
                }
            });

        this.dialog = $dialog;
    }

    yes(){
        this.patientService.confirmVerified();
        this.dialog.dialog('close');
    }

    no(){
        this.patientService.confirmNotVerified();
        this.dialog.dialog('close');
    }


}

