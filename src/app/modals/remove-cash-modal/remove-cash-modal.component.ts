import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA} from "@angular/material";


@Component({
  selector: 'app-remove-cash-modal',
  templateUrl: './remove-cash-modal.component.html',
  encapsulation: ViewEncapsulation.None
})
export class RemoveCashModalComponent {

    removedCashAmount: any = '';
    validInput: boolean = false;
    error: string;

    constructor(
        public dialogRef: MdDialogRef<RemoveCashModalComponent>,
        @Inject(MD_DIALOG_DATA) public data: any) { }

    leaveModal(result?){
        if (result){
            if ( this.validInput ){
                this.error = undefined;
                this.dialogRef.close(parseFloat(this.removedCashAmount));
                console.log("Successfully passed.");
            }
        } else {
            console.log("Nothing passed. Closing window.")
            this.dialogRef.close();
        }
    }

    validateInput() {
        if (!this.removedCashAmount){
            this.validInput = false;
            this.error = undefined;
        }else if (isNaN(this.removedCashAmount) || parseFloat(this.removedCashAmount) < 0) {
            this.validInput = false;
            this.error = "Please enter a valid number.";
        } else if (parseFloat(this.removedCashAmount) > this.data.currentBalance) {
            this.validInput = false;
            this.error = "Please enter a number below the current balance."
        } else if (this.removedCashAmount.includes('.') && this.removedCashAmount.substr(this.removedCashAmount.indexOf('.')+1).length > 2){
            this.validInput = false;
            this.error = "Please round to the hundreths place."
        } else{
            this.validInput = true;
            this.error = undefined;
        }
    }
}
