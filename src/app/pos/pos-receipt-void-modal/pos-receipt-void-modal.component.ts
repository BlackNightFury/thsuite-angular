import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {ReceiptService} from "../../services/receipt.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {PosCartService} from "../../services/pos-cart.service";

declare const $: any;
@Component({
    selector: 'app-pos-receipt-void-modal',
    templateUrl: './pos-receipt-void-modal.component.html'
})
export class PosReceiptVoidModalComponent implements OnInit, AfterViewInit{
    protected dialog;

    error: string;
    notes: string;

    constructor(private element: ElementRef, private receiptService: ReceiptService, private cartService: PosCartService){

    }

    ngOnInit(){
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Void Receipt",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [
                    {
                        text: 'Cancel',
                        "class": 'dialog-button-cancel',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideReceiptVoidModal();
                }
            });

        this.dialog = $dialog;
    }


    validateNote(){
        if (!this.notes || this.notes.trim() === "") {
            console.log("Not a Valid Note: " + this.notes);
            return false;
        }
        console.log("Valid Note: " +  this.notes);
        return true;
    }

    voidReceipt() {
        if ( this.validateNote() ) {
            this.cartService.receiptVoidModalShowing.take(1).subscribe(receipt => {
                if (receipt) {
                    this.receiptService.void(receipt, this.notes).then((response) => {
                        if (response.metrcError) {
                            setTimeout(() => {
                                alert("The transaction was voided successfully in THSuite, but was not voided in Metrc. Please log into Metrc and void the receipt manually.");
                            }, 0);
                        }
                        receipt.deletedAt = new Date();
                        receipt.voidNotes = this.notes;
                        this.dialog.dialog('close');
                    });

                } else {
                    this.dialog.dialog('close');
                }
            })
        } else{
            this.error = "Please provide a reason for voiding this receipt.";
        }
    }

}
