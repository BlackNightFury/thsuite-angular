import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {IPatient} from "../../models/interfaces/patient.interface";
import {Http} from "@angular/http";
import {PatientService} from "../../services/patient.service";
import {Subscription} from "rxjs/Subscription";
import {ReceiptService} from "../../services/receipt.service";
import {Observable} from "rxjs/Observable";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {PatientNoteService} from "../../services/patient-note.service";
import * as moment from 'moment';
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";
declare const $: any;

@Component({
    selector: "app-patient-notes-modal",
    templateUrl: './patient-notes-modal.component.html',
    styleUrls: ['./patient-notes-modal.component.css']
})
export class PatientNotesModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    user: IUser;

    patient: IPatient;
    patientSubscription: Subscription;

    currentNote: string;

    source: string; //Top level breadcrumb

    constructor(
        private element: ElementRef,
        private http: Http,
        private patientService: PatientService,
        private patientNoteService: PatientNoteService,
        private userService: UserService
    ){

    }

    ngOnInit(){

        this.patientService.patientNotesModalPatient.subscribe(data => {
            let {patientId, source} = data;
            this.source = source;
            this.patientService.getAssociated(patientId).subscribe(patient => {
                console.log(patient);
                this.patient = this.patientService.dbInstance(patient);
            });
        });

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        })

    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Patient Notes",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 1000,
                classes: {
                    "ui-dialog": "patient-notes"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.patientService.hidePatientNotesModal();
                }
            });

        this.dialog = $dialog;
    }

    addNote(){

        if(!this.currentNote){
            return;
        }

        let note = this.patientNoteService.newInstance();
        note.patientId = this.patient.id;
        note.authorId = this.user.id;
        note.Author = this.user;
        note.note = this.currentNote;

        this.patientNoteService.save(note, () => {
            this.currentNote = ''; //Clear note
            if(!this.patient.PatientNotes){
                this.patient.PatientNotes = [];
            }
            this.patient.PatientNotes.unshift(note); //Add note to front
        })

    }


    close(){
        this.dialog.dialog('close');
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }


}

