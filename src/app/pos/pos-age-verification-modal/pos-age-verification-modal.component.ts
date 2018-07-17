import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {PosCartService} from "app/services/pos-cart.service";

import {environment} from "../../../environments/environment";

import * as moment from 'moment';

declare const $: any;

@Component({
    selector: "app-pos-age-verification-modal",
    templateUrl: "pos-age-verification-modal.component.html"
})
export class PosAgeVerificationModalComponent implements OnInit, AfterViewInit{

    protected dialog;
    public showBirthdaySelector: boolean = false;
    public birthdayInvalid: boolean = false;
    public tooYoung: boolean = false;
    public month: string = "";
    public day: string = "";
    public year: string = "";

    constructor(private element: ElementRef, private cartService: PosCartService){

    }

    ngOnInit(){

    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Verify Customer Age",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideAgeVerificationModal();
                }
            });

        this.dialog = $dialog;

    }

    focusNextInput(e){
        this.birthdayInvalid = false;
        let target = e.srcElement;
        let maxLength = parseInt(target.attributes["maxlength"].value, 10);
        let valLength = target.value.length;
        if (valLength >= maxLength) {
            let next = $(target).parent();
            while(next = next.next()){
                if(!next.length){
                    break;
                }
                if(next.find('.modal-birthday-input').length){
                    next.find('.modal-birthday-input').focus();
                    break;
                }
            }
        }else if(valLength === 0 && e.key === "Backspace"){
            let prev = $(target).parent();
            while(prev = prev.prev()){
                if(!prev.length){
                    break;
                }
                if(prev.find('.modal-birthday-input').length){
                    prev.find('.modal-birthday-input').focus();
                    break;
                }
            }
        }
    }

    yes(){
        if(environment.shouldShowBirthdateEntry){
            this.showBirthdaySelector = true;
        }else{
            this.cartService.ageVerified(true);
            this.dialog.dialog('close');
        }

    }

    no(){
        this.dialog.dialog('close');
        this.cartService.ageVerified(false);
    }

    validateDateComponents(){
        if(!this.month || !this.day || !this.year){
            this.birthdayInvalid = true;
            return false;
        }

        if(parseInt(this.month) > 12){
            this.birthdayInvalid = true;
            return false;
        }

        if(parseInt(this.day) > moment(this.year + "-" + this.month, "YYYY-MM").daysInMonth()){
            this.birthdayInvalid = true;
            return false;
        }

        return true;
    }

    verifyBirthday(){
        let validDate = this.validateDateComponents();
        if(validDate) {
            let birthday = moment(this.year + "-" + this.month + "-" + this.day);
            let difference = moment.duration(moment().diff(birthday)).asYears();
            if (difference < 21) {
                //Too young
                this.tooYoung = true;
                //TODO: Should this clear the cart and close modal?
            } else {
                //Proceed
                this.cartService.ageVerified(true);
                this.dialog.dialog('close');
            }
        }
    }


}
