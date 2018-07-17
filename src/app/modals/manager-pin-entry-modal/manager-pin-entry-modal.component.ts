import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {UserService} from "../../services/user.service";
import {PinEntryComponent} from "../../util/components/pin-entry/pin-entry.component";
import {PosCartService} from "../../services/pos-cart.service";

declare const $: any;

@Component({
    selector: "app-manager-pin-entry-modal",
    templateUrl: './manager-pin-entry-modal.component.html',
})

export class ManagerPinEntryModalComponent implements OnInit, AfterViewInit{
    @ViewChild(PinEntryComponent) pinEntryComponent: PinEntryComponent;

    protected dialog;

    source: string; //Top level breadcrumb
    pinEntrySuccess: boolean;

    constructor(
        private element: ElementRef,
        private userService: UserService,
        private cartService: PosCartService
    ){
    }

    ngOnInit(){
        console.log(this.pinEntryComponent);
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Manager Pin Entry",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 600,
                classes: {
                    "ui-dialog": "pin-entry"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.beforeClose();
                },
                open: function(){
                    jQuery('.ui-widget-overlay').bind('click',function(){
                        $dialog.dialog('close');
                    })
                }
            });

        this.dialog = $dialog;
    }

    beforeClose(){

        if (!this.pinEntrySuccess){
            this.cartService.managerPinModalClosedWithoutSuccess(true);
        }

        //Hide modal
        this.cartService.hideManagerPinEntryModal();
    }

    close(){
        this.dialog.dialog('close');
    }

    onPinAttempt(pinCode) {

        this.userService.confirmManagerPin(pinCode.join("")).then((result) => {
            if (result) {
                this.pinEntrySuccess = true;
                this.close();
                this.cartService.managerPinEntrySuccess(result);
            } else {
                this.pinEntryComponent.handleIncorrect();
            }
        }).catch((err) => {
            this.pinEntryComponent.clear();
        });
    }
}
