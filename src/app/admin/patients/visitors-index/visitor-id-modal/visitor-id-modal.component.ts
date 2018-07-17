import {AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild} from "@angular/core";
import {IVisitor} from "../../../../models/interfaces/visitor.interface";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {VisitorService} from "../../../../services/visitor.service";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";
declare const $: any;

@Component({
    selector: "app-visitor-id-modal",
    templateUrl: './visitor-id-modal.component.html',
    styleUrls: ['./visitor-id-modal.component.css']
})
export class VisitorIdModalComponent implements OnInit, AfterViewInit, OnDestroy{

    protected dialog;

    visitor: IVisitor;
    modalSubscription: Subscription;
    visitorSubscription: Subscription;

    source: string; //Top level breadcrumb

    title: string = "Visitor :";

    mode: string;

    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;

    constructor(
        private element: ElementRef,
        private http: Http,
        private visitorService: VisitorService
    ){

    }

    ngOnInit(){

        this.modalSubscription = this.visitorService.visitorIdModalVisitor.subscribe(data => {
            let {visitorId, source, mode} = data;
            this.source = source;
            this.mode = mode;

            this.visitorSubscription = this.visitorService.getAssociated(visitorId).subscribe(visitor => {
                this.visitor = visitor;

                this.title = "Visitor : " + this.visitor.firstName + " " + this.visitor.lastName;

                this.dialog.dialog({ title: this.title });
            });
        })
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: this.title,
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 3000,
                width: 1000,
                classes: {
                    "ui-dialog": "visitor-id"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {

                    this.visitorService.hideVisitorIdModal();
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
        
        if(this.modalSubscription) {
            this.modalSubscription.unsubscribe();
        }

        if(this.visitorSubscription) {
            this.visitorSubscription.unsubscribe();
        }
    }
}

