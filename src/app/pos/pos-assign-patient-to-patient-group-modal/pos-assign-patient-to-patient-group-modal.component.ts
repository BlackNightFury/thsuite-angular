import {AfterViewInit, Component, ElementRef, OnInit, ViewEncapsulation} from "@angular/core";
import {ReceiptService} from "../../services/receipt.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {PosCartService} from "../../services/pos-cart.service";
import { IPatient } from "../../models/interfaces/patient.interface";
import { Observable } from "rxjs/Observable";
import { PatientGroupService } from "../../services/patient-group.service";
import { CommonAdapter } from "../../util/select2-adapters/common-adapter";
import { PatientService } from "../../services/patient.service";

declare const $: any;
@Component({
    selector: 'app-pos-assign-patient-to-patient-group-modal',
    templateUrl: './pos-assign-patient-to-patient-group-modal.component.html',
    styleUrls: ['pos-assign-patient-to-patient-group-modal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PosAssignPatientToPatientGroupModalComponent implements OnInit, AfterViewInit {
    protected dialog;
    public patient: IPatient;
    patientGroupSelect2Options: Select2Options;
    public completed = false;
    newPatientGroupName: string;
    initialPatientGroup;

    constructor(
        private element: ElementRef,
        private cartService: PosCartService,
        private patientService: PatientService,
        private patientGroupService: PatientGroupService) {}

    ngOnInit() {
        this.getPatientData();

        Observable.combineLatest(
            CommonAdapter(this.patientGroupService, 'id', 'name')
        ).toPromise()
        .then(([PatientGroupAdapter]) => {

            this.patientGroupSelect2Options = {
                ajax: {},
                placeholder: 'Select Patient Group'
            };
            this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;

        });

        this.initialPatientGroup = this.patient.patientGroupId;
    }

    ngAfterViewInit() {

        const $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Assign Patient to Patient Group",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [],
                beforeClose: (evt, ui) => {
                     this.cartService.hideAssignPatientToPatientGroupModal();
                }
            });

        this.dialog = $dialog;
    }

    getPatientData() {
        this.cartService.assignPatientToPatientGroupModalShowing.take(1).subscribe(patient => {
            if (patient) {
                this.patient = patient;
            } else {
                this.dialog.dialog('close');
            }
        });
    }

    formatMedID(id: string) {
        if (!id) {
            return;
        }
        return PatientService.formatPatientMedicalId(id);
    }

    save() {
        this.patientService.save(this.patient, false, () => {
            this.completed = true;
            this.initialPatientGroup = this.patient.patientGroupId;
        });
    }

    cancel() {
        // don't lose old patientGroup
        this.patient.patientGroupId = this.initialPatientGroup;
        this.dialog.dialog('close');
    }

    patientGroupChange(patient, event, s2) {
         this.newPatientGroupName = s2.element[0].selectedOptions[0].innerText;
    }

}
