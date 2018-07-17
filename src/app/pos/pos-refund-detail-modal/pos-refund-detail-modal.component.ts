
import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from "@angular/core";
import {LineItemService} from "../../services/line-item.service";
import {TransactionService} from "../../services/transaction.service";
import {PatientService} from "../../services/patient.service";
import {PosCartService} from "../../services/pos-cart.service";
import {PrinterService} from "../../services/printer.service";
import {UserService} from "../../services/user.service";

import {IReceipt} from "../../models/interfaces/receipt.interface";
import {IPatient} from "../../models/interfaces/patient.interface";
import {IUser} from "../../models/interfaces/user.interface";
import {PatientCartWithStart} from "../pos-patient-queue/patient-cart-with-start";
import * as uuid from "uuid";
import {StoreService} from "../../services/store.service";
import {IStore} from "../../models/interfaces/store.interface";
import {DrawerService} from "../../services/drawer.service";

declare const $: any;

@Component({
    selector: 'app-pos-refund-detail-modal',
    templateUrl: './pos-refund-detail-modal.component.html',
    styleUrls: [ './pos-refund-detail-modal.component.css' ]
})
export class PosRefundDetailModalComponent implements OnInit, AfterViewInit{

    _newPatient: IPatient;

    receipt: IReceipt;

    user: IUser;

    store: IStore;

    protected dialog;

    constructor(
        private element: ElementRef,
        private cartService: PosCartService,
        private patientService: PatientService,
        private lineItemService: LineItemService,
        private transactionService: TransactionService,
        private printerService: PrinterService,
        private userService: UserService,
        private storeService: StoreService,
        private drawerService: DrawerService
    ){

    }

    ngOnInit(){

        this.cartService.receiptForRefund.subscribe(receipt => {
            this.receipt = receipt;
        });

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        });
    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        const refundButton = {
            text: "Add refunds to cart",
            "class": 'dialog-button-add-refunds-cart',
            click: () => {
                const cart = this.cartService.newInstance()
                cart.lineItems = this.receipt.LineItems
                    .filter(item => item.isReturning)
                    .map(item => {
                        item.isReturning = false;
                        const newLineItem = this.lineItemService.newInstance()
                        Object.assign( newLineItem, {
                            storeId: item.storeId,
                            receiptId: '',
                            productId: item.productId,
                            Product: item.Product,
                            productVariationId: item.productVariationId,
                            ProductVariation: item.ProductVariation,
                            discountId: undefined,
                            Discount: undefined,
                            barcodeId: item.barcodeId,
                            Barcode: item.Barcode,
                            discountAmount: undefined,
                            price: item.price,
                            quantity: item.quantity - item.returnedQuantity
                        } )

                        newLineItem.Transactions = item.Transactions.map( transaction => {
                            const newTransaction = this.transactionService.newInstance()
                            const ratio = ( transaction.QuantitySold - transaction.returnedQuantity ) / transaction.QuantitySold;
                            Object.assign( newTransaction, {
                                storeId: transaction.storeId,
                                Store: transaction.Store,
                                lineItemId: transaction.lineItemId,
                                packageId: transaction.packageId,
                                Package: transaction.Package,
                                productId: transaction.productId,
                                Product: transaction.Product,
                                productVariationId: transaction.productVariationId,
                                ProductVariation: transaction.ProductVariation,
                                itemId: transaction.itemId,
                                Item: transaction.Item,
                                barcodeProductVariationItemPackageId: transaction.barcodeProductVariationItemPackageId,
                                TransactionTaxes: transaction.TransactionTaxes,
                                QuantitySold: transaction.QuantitySold - transaction.returnedQuantity,
                                TotalPrice: ( ratio * transaction.TotalPrice ) * -1,
                                discountId: transaction.discountId,
                                Discount: transaction.Discount,
                                discountAmount: transaction.discountAmount,
                                isReturn: true,
                                originalTransactionId: transaction.id,
                                originalTransactionTotalPrice: transaction.TotalPrice,
                                originalTransactionQuantitySold: transaction.QuantitySold,
                                originalTransactionReturnedQuantity: transaction.returnedQuantity
                            } )
                            return newTransaction
                        } )
                        return newLineItem;
                    } )

                if( cart.lineItems.length === 0 ) return

                this.cartService.setCart(cart)

                let patient = this.receipt.Patient
                if( !patient ) {
                    patient = this.patientService.newInstance()
                }

                let newPatient = {
                    patient,
                    cart,
                    startTime: new Date()
                };

                $dialog.dialog('close');
                this.patientService.initiateRefund(newPatient)
                this.cartService.refreshCart()
            }
        }

        let buttons = [
            {
                text: 'Cancel',
                "class": 'dialog-button-cancel',
                click: () => {
                    $dialog.dialog('close');
                }
            }
        ]

        let allReturns = true
        this.receipt.LineItems.forEach(lineItem => {
            if(!lineItem.isReturn) { allReturns = false; }
        })

        if(allReturns) {
            buttons.push( {
                text: 'Print Receipt',
                "class": 'dialog-button-add-refunds-cart',
                click: () => {
                    this.printerService.printReceipt(this.receipt, this.store);
                    $dialog.dialog('close');
                }
            } )
        } else {
            buttons.push(refundButton)
        }

        this.dialog = $dialog
            .dialog({
                title: "Refund previous purchase",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 1000,
                maxHeight: 600,
                width: 1000,
                height: 600,
                classes: {
                    "ui-dialog": "refund-modal"
                },
                buttons,
                beforeClose: (evt, ui) => {
                    console.log('hiding')
                    this.cartService.hideRefundDetailModal();
                }
            });

        this.drawerService.getCurrent(false, localStorage.getItem('deviceId')).take(1).subscribe(drawer => {
            if(!drawer || !drawer.startingAmount || drawer.startingAmount <= 0){
                this.dialog.dialog('close');
                this.drawerService.open(true);
            }
        });

    }

    loadNewReceipt(barcode: string) {
        console.log('Loading Receipt with Barcode ' + barcode);
        this.cartService.refundDetailModal(barcode);
    }

    onReturnBtnClick( btn, item ) {
        item.isReturning = !item.isReturning
        btn.classList.toggle('selected', item.isReturning)
    }
}
