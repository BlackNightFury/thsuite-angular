import {AfterViewInit, Component, ElementRef, OnInit, Input, Output, EventEmitter} from "@angular/core";

declare const $: any;
@Component({
    selector: 'app-export-options-modal',
    templateUrl: './export-options-modal.component.html',
    styleUrls: ['./export-options-modal.component.css']
})
export class ExportOptionsModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    @Output() onModalClosed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onExport: EventEmitter<any> = new EventEmitter<any>();
    @Input() isExportOptionsModalShowing: boolean = false;

    private _isExportOptionsModalAboutToClose: boolean = false;
    get isExportOptionsModalAboutToClose(): boolean {
        return this._isExportOptionsModalAboutToClose;
    }

    @Input()
    set isExportOptionsModalAboutToClose(val) {
        this._isExportOptionsModalAboutToClose = val;

        if (this._isExportOptionsModalAboutToClose && this.dialog) {
            this.dialog.dialog('close');
        }
    }

    exportGenerationInProgress: boolean = false;

    constructor(private element: ElementRef) {}

    ngOnInit(){
        this.exportGenerationInProgress = false;
    }

    ngAfterViewInit(){

        if (!this._isExportOptionsModalAboutToClose) {
            const $dialog = $(this.element.nativeElement);

            $dialog
                .dialog({
                    title: "Please Choose Export Format",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    maxWidth: 800,
                    maxHeight: 600,
                    width: 600,
                    beforeClose: (evt, ui) => {
                        this.onModalClosed.emit();
                        this.isExportOptionsModalShowing = false;
                    },
                    create: function (event, ui) {
                        $(event.target).parent().css('position', 'fixed');
                    }
                });

            this.dialog = $dialog;
        }
    }

    onExportOptionsModalExportClick(type: string) {
        this.onExport.emit(type);
        this.exportGenerationInProgress = true;
    }
}
