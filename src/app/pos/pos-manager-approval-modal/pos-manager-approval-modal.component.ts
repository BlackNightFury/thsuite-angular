
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {UserService} from "../../services/user.service";

declare const $: any;

@Component({
    selector: 'app-pos-manager-approval-modal',
    templateUrl: './pos-manager-approval-modal.component.html',
    styleUrls: ['./pos-manager-approval-modal.component.css']
})
export class PosManagerApprovalModalComponent implements OnInit, AfterViewInit{

    public digits: any[] = ["", "", "", ""];
    public pinConfirmed: boolean = true;
    protected dialog;

    constructor(private element: ElementRef, private cartService: PosCartService, private userService: UserService){

    }

    ngOnInit(){


    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Enter Manager Pin for Approval",
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
                    },
                    {
                        text: "Submit",
                        "class": 'green',
                        click: () => {
                            let pin = this.digits.join('');
                            this.confirmPin(pin);
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideManagerApprovalModal();
                }
            });

        this.dialog = $dialog;

    }

    async confirmPin(pin){
        let result = await this.userService.confirmManagerPin(pin);
        this.pinConfirmed = result;
        this.cartService.managerApproval(result);
        if(result){
            this.dialog.dialog('close');
        }
    }

    clearInputs(){
        this.digits = ["", "", "", ""];
        this.pinConfirmed = true;
        $(this.element.nativeElement).find('input').first().focus();
    }

    focusNextInput(e){
        //Reset pin message
        this.pinConfirmed = true;
        let target = e.srcElement;
        let maxLength = parseInt(target.attributes["maxlength"].value, 10);
        let valLength = target.value.length;
        if (valLength >= maxLength) {
            let next = target;
            while (next = next.nextElementSibling) {
                if (next == null)
                    break;
                if (next.tagName.toLowerCase() == "input") {
                    next.focus();
                    break;
                }
            }
        }else if(valLength === 0 && e.key === "Backspace"){
            let prev = target;
            while(prev = prev.previousElementSibling){
                if(prev == null){
                    break;
                }
                if(prev.tagName.toLowerCase() == 'input'){
                    prev.focus();
                    break;
                }
            }
        }
    }

    enterPressed() {
        let pin = this.digits.join('');
        this.confirmPin(pin);
    }

}
