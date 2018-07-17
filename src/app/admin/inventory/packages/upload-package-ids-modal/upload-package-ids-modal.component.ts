import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import {PackageService} from "../../../../services/package.service";
import {PackageConversionService} from "../../../../services/package-conversion.service";
import {PackageUnusedLabelService} from "../../../../services/package-unused-label.service";

declare const $: any;

@Component({
    selector: "app-upload-package-ids-modal",
    templateUrl: './upload-package-ids-modal.component.html',
    styleUrls: ['./upload-package-ids-modal.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UploadPackageIdsModalComponent implements OnInit, AfterViewInit, OnDestroy{

    protected dialog;

    newPackageIdsFile:File;
    newPackageIdsFileUrl:string;
    dropMessage:string = "";
    fileUploadExtensions = ['text/csv'];

    showingResult:boolean = false;

    uploadError;

    constructor(
        private element: ElementRef,
        private packageService: PackageService,
        private packageConversionService: PackageConversionService,
        private packageUnusedLabelService: PackageUnusedLabelService
    ){

    }

    ngOnInit(){
    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Import New PackageIDs from Metrc",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 800,
                width: 800,
                classes: {
                    "ui-dialog": "upload-package-ids-modal"
                },
                buttons: [
                ],
                beforeClose: (evt, ui) => {
                    this.packageService.hideUploadIdsModal();
                }
            });

        this.dialog = $dialog;
    }

    ngOnDestroy() {

    }

    setFiles($event) {
        //Always work with first
        var file = $event[0];

        this.newPackageIdsFile = file;
    }

    uploadNewPackageIds() {

        const fileReaderText = new FileReader();

        fileReaderText.onload = (e) => {

            // TODO: maybe more sophisticated way like Papa Parse? https://www.papaparse.com
            var fileText = (<FileReader>e.target).result;

            //Make consistent between operating systems
            fileText = fileText.replace(/\r\n/g, "\n");
            fileText = fileText.replace(/\r/g, "\n");

            const rows = fileText.split("\n");

            // First column in csv
            const packageTags = rows.map(row => row.split(",")[0]);
            // Remove header
            packageTags.shift();

            console.log('packageTags', packageTags);

            this.packageUnusedLabelService.uploadNewPackageIds(packageTags.filter(tag => tag)).then(numberOfImportedTags => {
                // TODO: display number of imported tags?
                this.showingResult = true;
            }).catch(err => {

                this.uploadError = err;

                this.showingResult = false;
            });
        };

        fileReaderText.readAsText(this.newPackageIdsFile);
    }

    reset() {
        this.newPackageIdsFile = null;

        this.showingResult = false;
    }

    close() {
        this.dialog.dialog("close");
    }
}
