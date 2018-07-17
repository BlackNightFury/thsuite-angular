import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ReceiptService} from "../../services/receipt.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";

declare const $: any;

@Component({
    selector: 'app-pos-void-detail-modal',
    templateUrl: './pos-void-detail-modal.component.html',
    styleUrls: ['./pos-void-detail-modal.component.css']
})
export class PosVoidDetailModalComponent implements OnInit, AfterViewInit{

    receipt: IReceipt;

    constructor(private element: ElementRef, private receiptService: ReceiptService){
        this.receiptService.receiptForVoid.subscribe(receipt => {
            this.receipt = receipt;
        });
    }

    ngOnInit(){
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Void Order",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 800,
                height: 600,
                buttons: [
                    {
                        text: "Void",
                        "class": 'dialog-button-void-transaction',
                        click: () => {
                            console.log("TODO: Implement.");
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.receiptService.hideVoidDetailModal();
                }
            })

    }
}
