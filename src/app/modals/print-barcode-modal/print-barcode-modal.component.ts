import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from "@angular/material";

@Component({
  selector: 'app-print-barcodes-modal',
  templateUrl: './print-barcode-modal.component.html',
  encapsulation: ViewEncapsulation.None
})
export class PrintBarcodeModalComponent {

    numToPrint: any = '';
    error: string;

    constructor(
        public dialogRef: MdDialogRef<PrintBarcodeModalComponent>,
        @Inject(MD_DIALOG_DATA) public data: any) { }

    leaveModal(result?){
        if (result){
            if (!isNaN(this.numToPrint) && parseInt(this.numToPrint) > 0 ){
                this.dialogRef.close(parseInt(this.numToPrint));
                this.error = undefined;
            } else{
                this.error = "Please enter a valid number.";
            }
        } else {
            this.dialogRef.close();
        }
    }
}
