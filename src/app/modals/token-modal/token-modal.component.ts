import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {Http} from "@angular/http";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
import {UserService} from "../../services/user.service";
declare const $: any;

@Component({
    selector: "app-token-modal",
    templateUrl: './token-modal.component.html',
    // styleUrls: ['./patient-id-modal.component.css']
})
export class TokenModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    token: string;
    tokenSubscription: Subscription;

    constructor(
        private element: ElementRef,
        private http: Http,
        private userService: UserService
    ){

    }

    ngOnInit(){

        this.tokenSubscription = this.userService.tokenEmitted.subscribe(token => {
            this.token = token;
        })

    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "JWT Token",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 800,
                width: 1000,
                height: 200,
                classes: {
                    "ui-dialog": "token"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.userService.hideTokenModal();
                },
                open: function(){
                    jQuery('.ui-widget-overlay').bind('click',function(){
                        $dialog.dialog('close');
                    })
                }
            });

        this.dialog = $dialog;
    }

    close(){
        this.dialog.dialog('close');
    }

    ngOnDestroy() {

        this.tokenSubscription && this.tokenSubscription.unsubscribe();

    }

}

