import {Component, Injector, OnInit} from "@angular/core";
import * as moment from 'moment';
import {IUser} from "../../models/interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {IScale} from "../../models/interfaces/scale.interface";
import {IPrinter} from "../../models/interfaces/printer.interface";
import {PrinterService} from "../../services/printer.service";
import {ScaleService} from "../../services/scale.service";
import {PosCartService} from "../../services/pos-cart.service";
import {environment} from "../../../environments/environment";


@Component({
    selector: 'app-pos-settings',
    templateUrl: './pos-settings.component.html',
    styleUrls: [ './pos-settings.component.css' ]
})

export class PosSettingsComponent implements OnInit {

    hasRegisteredReceiptPrinter: boolean = false;
    hasRegisteredLabelPrinter: boolean = false;
    hasRegisteredScale: boolean = false;

    registeredReceiptPrinter: IPrinter;
    registeredLabelPrinter: IPrinter;
    registeredScale: IScale;

    environment;

    constructor(injector: Injector, private userService: UserService, private cartService: PosCartService, private scaleService: ScaleService, private printerService: PrinterService ){
    }

    ngOnInit() {

        this.environment = environment;

        //Get registered printers and scales
        this.getRegisteredPrinters();
        this.getRegisteredScale();

        this.scaleService.scaleRegisteredEmitted
            .subscribe(() => {
                this.getRegisteredScale();
            });

        this.printerService.printerRegisteredEmitted
            .subscribe(() => {
                this.getRegisteredPrinters();
            })

    }

    getRegisteredScale(){
        let scaleId = localStorage.getItem('scaleId');
        if(scaleId){
            this.scaleService.get(scaleId)
                .subscribe(scale => {
                    if(scale){
                        this.hasRegisteredScale = true;
                        this.registeredScale = scale;
                    }
                })
        }
    }

    getRegisteredPrinters(){
        let receiptPrinterId = localStorage.getItem('receiptPrinterId');
        let labelPrinterId = localStorage.getItem('labelPrinterId');
        if(receiptPrinterId){
            this.printerService.get(receiptPrinterId)
                .subscribe(printer => {
                    if(printer){
                        this.hasRegisteredReceiptPrinter = true;
                        this.registeredReceiptPrinter = printer;
                    }
                })
        }

        if(labelPrinterId){
            this.printerService.get(labelPrinterId)
                .subscribe(printer => {
                    if(printer){
                        this.hasRegisteredLabelPrinter = true;
                        this.registeredLabelPrinter = printer;
                    }
                })
        }

    }

    registerDevice(type: string){
        //Show device registration modal
        this.cartService.showDeviceRegistrationModal();
        this.cartService.deviceRegistrationType(type);
    }

    signOut() {
        this.userService.doLogout()
    }

    unregisterDevice(type: string){
        localStorage.removeItem(type+'Id');
        if(type == 'receiptPrinter'){
            this.hasRegisteredReceiptPrinter = false;
            this.registeredReceiptPrinter = undefined;
        }else if(type == 'labelPrinter'){
            this.hasRegisteredLabelPrinter = false;
            this.registeredLabelPrinter = undefined;
        }else if(type == 'scale'){
            this.hasRegisteredScale = false;
            this.registeredScale = undefined;
        }
    }

    testPrint(type: string){
        if(type == 'label'){
            this.printerService.printTestLabel();
        }else if(type == 'receipt'){
            this.printerService.printTestReceipt();
        }else if(type == 'bulk'){
            this.printerService.printBulkFlowerLabelsTest();
        }else if(type == 'patient'){
            this.printerService.printPatientLabelsTest();
        }else{
            console.log("Not implemented!")
        }
    }
}
