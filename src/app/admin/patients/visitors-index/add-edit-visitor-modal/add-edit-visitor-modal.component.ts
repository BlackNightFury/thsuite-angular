import {AfterViewInit, Injector, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import * as moment from 'moment-timezone';
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {Lightbox} from "angular2-lightbox";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {IVisitor} from "../../../../models/interfaces/visitor.interface";
import {VisitorService} from "../../../../services/visitor.service";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

declare const $: any;

@Component({
    selector: "app-add-edit-visitor-modal",
    templateUrl: './add-edit-visitor-modal.component.html',
    styleUrls: ['./add-edit-visitor-modal.component.css']
})
export class AddEditVisitorModalComponent extends AddEditViewObjectComponent<IVisitor> implements OnInit, AfterViewInit, OnDestroy {

    protected dialog;

    visitReasonsSelect2Options: Select2Options;
    addingNewVisitReason = false;

    idFileHolder:FileHolder;
    signatureFileHolder:FileHolder;

    errors: string[];

    saving = false;

    errorFlags: any = {
        firstName: false,
        lastName: false,
        visitReason : false
    };

    @ViewChild("idImageUpload") private idImageUploadComponent: ImageUploadComponent;
    @ViewChild("signatureUpload") private signatureUploadComponent: ImageUploadComponent;

    constructor(
        private injector: Injector,
        private element: ElementRef,
        private http: Http,
        private lightbox: Lightbox,
        private visitorService: VisitorService,
        private loadingBarService: SlimLoadingBarService
    ){
        super(injector, visitorService);
    }

    ngOnInit() {
        super.ngOnInit();

        var visitReasonOptions = this.visitorService.getVisitReasons();
        visitReasonOptions.push("Other");

        this.visitReasonsSelect2Options = {
            data: visitReasonOptions
        };

        this.objectObservable.subscribe(object => {
            var visitReasons = this.visitorService.getVisitReasons();
            if(visitReasons.indexOf(this.object.visitReason) == -1 && this.object.visitReason){
                this.addingNewVisitReason = true;
            }
        });
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "New Visitor",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 3000,
                width: 800,
                classes: {
                    "ui-dialog": "add-edit-visitor-modal"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.visitorService.hideAddEditVisitorModal();
                }
            });

        this.dialog = $dialog;

        this.dialog.scrollTop(0);
    }

    onVisitReasonChange(reason){
        if(reason == "Other"){
            this.addingNewVisitReason = true;
            this.object.visitReason = "";
        } else {
            this.object.visitReason = reason;
        }
    }

    backToPredefinedReasons(){
        this.addingNewVisitReason = false;
        this.object.visitReason = "";
    }

    prepareIdImage(fileHolder: FileHolder){
        this.idFileHolder = fileHolder;
    }

    prepareSignature(fileHolder: FileHolder){
        this.signatureFileHolder = fileHolder;
    }

    uploadImage(fileHolder, fieldName, imageUploadComponent) {
        return new Promise((resolve,reject) => {

            this.visitorService.getUploadParams('image/*').then(params => {

                var sanitizedFileName = fileHolder.file.name.replace(/[^\w.]+/g, "_");

                const formData = new FormData();

                formData.append('key', params.name);
                formData.append('AWSAccessKeyId', params.key);
                formData.append('policy', params.policy);
                formData.append('success_action_status', '201');
                formData.append('signature', params.signature);
                formData.append('Content-Type', params.contentType);
                formData.append('file', fileHolder.file, sanitizedFileName);

                return this.http
                    .post(params.action, formData)
                    .toPromise()
            })
            .then(response => {
                console.log(response);
                if (response.status !== 201) {
                    throw new Error('Error uploading image')
                }

                let $response = $(response._body);

                this.object[fieldName] = decodeURIComponent($response.find('Location').text());

                resolve();
            })
            .catch(err => {
                alert(err.message);

                reject();
            })
        });
    }

    clearErrorFlags(){

        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        });
    }

    async validateVisitor():Promise<boolean>{
        this.clearErrorFlags();
        let errors = [];

        if(!this.object.firstName) {
            errors.push("First Name is a required field.");
            this.errorFlags.firstName = true;
        }

        if(!this.object.lastName) {
            errors.push("Last Name is a required field.");
            this.errorFlags.lastName = true;
        }

        if(!this.object.visitReason) {
            errors.push("Visit Reason is a required field.");
            this.errorFlags.visitReason = true;
        }

        if(!this.idFileHolder) {
            errors.push("Photo ID is a required field.");
            this.errorFlags.idImage = true;
        }

        if(!this.signatureFileHolder) {
            errors.push("Signature is a required field.");
            this.errorFlags.signature = true;
        }

        this.errors = errors;

        this.dialog.scrollTop(0);
        document.documentElement.scrollTop = 0;

        if(errors.length) {
            return false;
        }

        return true;
    }

    async saveVisitor(){
        this.clearErrorFlags();

        if(await this.validateVisitor()){

            this.loadingBarService.interval = 100;
            this.loadingBarService.start();

            this.saving = true;

            this.uploadImage(this.idFileHolder, "idImage", this.idImageUploadComponent).then(() => {
                this.uploadImage(this.signatureFileHolder, "signature", this.signatureUploadComponent).then(() => {
                    this.visitorService.save(this.object, false, () => {
                        this.mode = "view";

                        this.dialog.dialog('option', 'title', 'New Visitor was Checked In!');

                        this.loadingBarService.complete();

                        this.saving = false;
                    });
                }).catch((err) => {
                    this.loadingBarService.complete();

                    this.saving = false;
                });
            }).catch((err) => {
                this.loadingBarService.complete();

                this.saving = false;
            });
        }
    }

    cancel(){
        this.dialog.dialog('close');
    }

    checkIn(){
        this.saveVisitor();
    }

    close(){
        this.dialog.dialog('close');
    }

    viewId(){
        this.visitorService.showVisitorIdModal(this.object, "Check In Visitor", "view");
        document.documentElement.scrollTop = 0;
    }
}
