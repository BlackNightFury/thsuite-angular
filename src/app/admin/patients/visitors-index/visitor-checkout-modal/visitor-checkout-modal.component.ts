import {AfterViewInit, Component, ElementRef, OnInit, OnDestroy} from "@angular/core";
import {IVisitor} from "../../../../models/interfaces/visitor.interface";
import {Http} from "@angular/http";
import {VisitorService} from "../../../../services/visitor.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
declare const $: any;

@Component({
    selector: "app-visitor-checkout-modal",
    templateUrl: './visitor-checkout-modal.component.html',
    styleUrls: ['./visitor-checkout-modal.component.css']
})
export class VisitorCheckoutModalComponent implements OnInit, AfterViewInit, OnDestroy {

    protected dialog;

    mode:string = 'confirm';

    visitor: IVisitor;
    modalSubscription: Subscription;
    visitorSubscription: Subscription;

    source: string; //Top level breadcrumb

    constructor(
        private element: ElementRef,
        private visitorService: VisitorService
    ){

    }

    ngOnInit(){

        this.modalSubscription = this.visitorService.visitorCheckoutModalVisitor.subscribe(data => {

            let {visitorId, source} = data;
            this.source = source;

            this.visitorSubscription = this.visitorService.getAssociated(visitorId).subscribe(visitor => {
                
                this.visitor = visitor;
            });
        })
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Check Out Visitor?",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 3000,
                width: 800,
                classes: {
                    "ui-dialog": "visitor-checkout"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {

                    this.visitorService.hideVisitorCheckoutModal();
                },
                open: function(){
                    jQuery('.ui-widget-overlay').bind('click',function(){
                        $dialog.dialog('close');
                    })
                }
            });

        this.dialog = $dialog;

        this.dialog.scrollTop(0);
    }

    onConfirm(){
        this.mode = "complete";

        this.dialog.scrollTop(0);
        document.documentElement.scrollTop = 0;

        this.dialog.dialog('option', 'title', 'Visitor was successfully checked out!');

        if(!this.visitor.clockOut) {
            this.visitor.clockOut = new Date();

            this.visitorService.save(this.visitor);
        }
    }

    close(){
        this.dialog.dialog('close');
    }

    ngOnDestroy() {
        
        if(this.modalSubscription) {
            this.modalSubscription.unsubscribe();
        }

        if(this.visitorSubscription) {
            this.visitorSubscription.unsubscribe();
        }
    }

    viewId(){
        this.visitorService.showVisitorIdModal(this.visitor, "Check Out Visitor", "view");
        document.documentElement.scrollTop = 0;
    }
}

