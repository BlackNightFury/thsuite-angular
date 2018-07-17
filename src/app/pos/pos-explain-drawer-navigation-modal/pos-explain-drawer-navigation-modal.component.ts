import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";

import {DrawerService} from "../../services/drawer.service";

declare const $: any;
@Component({
    selector: 'app-pos-explain-drawer-navigation-modal',
    templateUrl: './pos-explain-drawer-navigation-modal.component.html'
})
export class PosExplainDrawerNavigationModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    constructor(private element: ElementRef, private drawerService: DrawerService) {}

    ngOnInit(){}

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [
                    {
                        text: 'Okay',
                        "class": 'dialog-button-cancel-trasaction-completed',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.drawerService.hideExplainDrawerNavigationModal();
                },
                create: function (event, ui) {
                    $(event.target).parent().css('position', 'fixed');
                }
            });

        this.dialog = $dialog;
    }
}
