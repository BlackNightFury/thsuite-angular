import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";
declare const $: any;

@Component({
    selector: 'app-pos-oversale-modal',
    templateUrl: './pos-oversale-modal.component.html'
})
export class PosOversaleModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    constructor(private element: ElementRef, private cartService: PosCartService){

    }

    ngOnInit(){

    }

    ngAfterViewInit(){
        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Oversale Limit Reached!",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [
                    {
                        text: 'OK',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    //Hide modal
                    this.cartService.hideOversaleLimitModal();
                }
            });

        this.dialog = $dialog;

    }

}
