import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";

import {PosCartService} from "../../services/pos-cart.service";
import {PrinterService} from "../../services/printer.service";
import {StoreService} from "../../services/store.service";
import {UserService} from "../../services/user.service";

import {IReceipt} from "../../models/interfaces/receipt.interface";
import {IStore} from "../../models/interfaces/store.interface";
import {IUser} from "../../models/interfaces/user.interface";

import {Subscription} from "rxjs/Subscription"

import {environment} from "../../../environments/environment";

declare const $: any;
@Component({
    selector: 'app-pos-transaction-completed-modal',
    templateUrl: './pos-transaction-completed-modal.component.html'
})
export class PosTransactionCompletedModalComponent implements OnInit, AfterViewInit{

    changeDue: number;

    receipt: IReceipt;

    salesTotal: number;

    store: IStore;

    user: IUser;

    protected dialog;

    private currentStoreEmittedSubscription: Subscription;
    private transactionCompletedSubscription: Subscription;
    private userEmittedSubscription: Subscription;

    public environment;

    constructor(private element: ElementRef, private cartService: PosCartService, private userService: UserService, private printerService: PrinterService, private storeService: StoreService){
        this.userEmittedSubscription = this.userService.userEmitted.subscribe( user => this.user = user )
        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe( store => this.store = store )
    }


    ngOnInit(){

        this.environment = environment;

        this.transactionCompletedSubscription =
            this.cartService.transactionCompletedEmitted.subscribe(receipt => {
                this.receipt = receipt;
                this.changeDue = ( receipt.amountPaid || 0 ) - (receipt.total);
                this.salesTotal = receipt.total
            });

    }

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
                        text: 'Close',
                        "class": 'dialog-button-cancel-trasaction-completed',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideTransactionCompletedModal();
                }
            });

        this.dialog = $dialog;
    }

    ngOnDestroy(){
        this.userEmittedSubscription && this.userEmittedSubscription.unsubscribe();
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
        this.transactionCompletedSubscription && this.transactionCompletedSubscription.unsubscribe();
    }

    reprintLabels() {
        if(!environment.printPatientLabels){
            this.printerService.printTransactionLabels( this.receipt, this.store )
        }else{
            this.printerService.printPatientLabels(this.receipt, this.store);
        }
        this.printerService.printBulkFlowerLabels( this.receipt, this.store);
    }

    reprintReceipt() {
        this.printerService.printReceipt( this.receipt, this.store )
    }
}
