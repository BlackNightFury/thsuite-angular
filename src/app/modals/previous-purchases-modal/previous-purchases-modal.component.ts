import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {IPatient} from "../../models/interfaces/patient.interface";
import {Http} from "@angular/http";
import {PatientService} from "../../services/patient.service";
import {Subscription} from "rxjs/Subscription";
import {ReceiptService} from "../../services/receipt.service";
import {Observable} from "rxjs/Observable";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ILineItem} from "../../models/interfaces/line-item.interface";
import {LineItem} from "../../models/line-item.model";
declare const $: any;

@Component({
    selector: "app-previous-purchases-modal",
    templateUrl: './previous-purchases-modal.component.html',
    styleUrls: ['./previous-purchases-modal.component.css']
})
export class PreviousPurchasesModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    patient: IPatient;
    patientSubscription: Subscription;

    receipts: IReceipt[];
    allReceiptLineItems: ILineItem[] = [];
    currentReceiptLineItems: ILineItem[] = [];

    itemsPerPage: number = 15;  // change number of entries per page here
    numPages: number = 0;
    protected page: number = 0;

    get pageModel(): number {
        return this.page;
    }

    set pageModel(value: number) {
        this.page = value;
        this.currentReceiptLineItems = this.allReceiptLineItems.slice(this.page*this.itemsPerPage,
            (this.page*this.itemsPerPage) + this.itemsPerPage );
    }

    viewingReceipt: boolean = false;
    viewedReceipt: IReceipt;

    source: string; //Top level breadcrumb

    constructor(
        private element: ElementRef,
        private http: Http,
        private patientService: PatientService,
        private receiptService: ReceiptService
    ){

    }

    ngOnInit(){
            this.patientService.previousPurchasesModalPatient.subscribe(data => {
                let {patientId, source} = data;
                this.source = source;
                this.patientService.getAssociated(patientId).subscribe(patient => {
                    console.log(patient);
                    this.patient = this.patientService.dbInstance(patient);

                    // Get all lineItems, not just receipts,  for this patient
                    this.receiptService.getByPatientId(this.patient.id).subscribe(receipts => {
                        this.receipts = receipts;
                        for (let eachReceipt of this.receipts){
                            this.allReceiptLineItems = this.allReceiptLineItems.concat(eachReceipt.LineItems);
                        }
                        this.numPages = Math.ceil(this.allReceiptLineItems.length / this.itemsPerPage);
                        this.currentReceiptLineItems = this.allReceiptLineItems.slice( this.page*this.itemsPerPage,
                            (this.page*this.itemsPerPage) + this.itemsPerPage );
                    });
                });
            })
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Previous Purchases",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 1000,
                classes: {
                    "ui-dialog": "previous-purchases"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.patientService.hidePreviousPurchasesModal();
                }
            });

        this.dialog = $dialog;
    }

    viewReceipt(lineItemReceiptId: string){
        for (let receipt of this.receipts){
            if (lineItemReceiptId == receipt.id){
                this.viewedReceipt = receipt;
                this.viewingReceipt = true;
                break;
            }
        }
    }

    getBarcode(lineItemReceiptId: string){
        for (let receipt of this.receipts) {
            if (lineItemReceiptId == receipt.id) {
                return receipt.barcode;
            }
        }
    }

    stopViewing(){
        this.viewedReceipt = null;
        this.viewingReceipt = false;
    }

    close(){
        this.dialog.dialog('close');
    }

    formatMedID(id: string){
        return PatientService.formatPatientMedicalId(id);
    }
}

