import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";
import {UserService} from "../../services/user.service";
import {PrinterService} from "../../services/printer.service";
import {ScaleService} from "../../services/scale.service";
import {IScale} from "../../models/interfaces/scale.interface";
import {IPrinter} from "../../models/interfaces/printer.interface";

declare const $: any;
@Component({
    selector: 'app-pos-device-registration-modal',
    templateUrl: './pos-device-registration-modal.component.html'
})
export class PosDeviceRegistrationModalComponent implements OnInit, AfterViewInit{
    protected dialog;

    deviceType: string;

    typeServiceMap;

    devices: IPrinter[] | IScale[];

    selectedDevice: IPrinter | IScale;
    noDeviceSelected: boolean = false;

    constructor(private element: ElementRef, private cartService: PosCartService, private userService: UserService, private scaleService: ScaleService, private printerService: PrinterService){

    }

    ngOnInit(){

        this.typeServiceMap = {
            'scale': this.scaleService,
            'receiptPrinter': this.printerService,
            'labelPrinter': this.printerService
        };

        this.cartService.deviceRegistrationTypeEmitted
            .subscribe(type => {
                this.deviceType = type;
                let service = this.typeServiceMap[type];
                service.allEnabled()
                    .subscribe(devices => {
                        this.devices = devices;
                    });
            });

    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Select Device to Register",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons: [
                    {
                        text: 'Cancel',
                        "class": 'dialog-button-cancel',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    },
                    {
                        text: "Register",
                        click: () => {
                            //Set localStorage to selected device id
                            if(this.registerDevice()){
                                $dialog.dialog('close');
                            }
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideDeviceRegistrationModal();
                }
            });

        this.dialog = $dialog;

    }

    select(device: IPrinter | IScale){
        console.log("Selected ", device.name);
        this.noDeviceSelected = false;
        this.selectedDevice = device;
    }

    registerDevice(): boolean{
        if(this.selectedDevice) {
            let storageId = this.deviceType + 'Id';
            localStorage.setItem(storageId, this.selectedDevice.id);
            let service = this.typeServiceMap[this.deviceType];
            service.registered();
            return true;
        }else{
            this.noDeviceSelected = true;
            return false;
        }
    }

}
