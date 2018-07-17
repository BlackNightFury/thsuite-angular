import {AfterViewInit, Component, ElementRef, OnInit} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";

import * as moment from 'moment';
import * as uuid from 'uuid';
import {Cart} from "../../models/cart.model";
import {Discount} from "../../models/discount.model";
import {IStore} from "../../models/interfaces/store.interface";
import {StoreService} from "../../services/store.service";
import {ILineItem} from "../../models/interfaces/line-item.interface";

declare const $: any;

@Component({
    selector: "app-pos-custom-discount-modal",
    templateUrl: "pos-custom-discount-modal.component.html"
})
export class PosCustomDiscountModalComponent implements OnInit, AfterViewInit{

    protected dialog;

    public step: 'cart' | 'type' | 'amount';

    cart: Cart;
    store: IStore;

    lineItemOrCart: 'cart' | 'line-item' = 'cart';

    cartOptions = [
        {
            label: 'Whole Cart',
            value: 'cart'
        },
        {
            label: 'Line Item',
            value: 'line-item'
        }
    ];

    lineItemSelect2Options: Select2Options = {
        placeholder: "Select a line item..."
    };

    selectedLineItemId: string;

    type: 'percent' | 'dollar';

    typeOptions = [
        {
            label: "Percent",
            value: 'percent'
        },
        {
            label: "Dollar",
            value: 'dollar'
        }
    ];

    dollarDiscountSelection: 'discount' | 'target' | 'target-no-tax' = 'discount';

    dollarDiscountOptions = [
        {
            label: "Discount Amount",
            value: 'discount'
        },
        {
            label: "Target Price",
            value: 'target'
        }
    ];

    amount: number;
    error: string;
    negError: string;
    notes: string;

    constructor(private element: ElementRef, private cartService: PosCartService, private storeService: StoreService){

    }


    ngOnInit(){

        this.step = 'cart';

        this.cartService.currentCartEmitted.subscribe(cart => {
            this.cart = cart;
            if(!this.cart.taxesIncluded){
                this.dollarDiscountOptions.push({
                    label: "Target Price No Tax",
                    value: 'target-no-tax'
                });
            }
            let options = [];
            for(let lineItem of this.cart.lineItems){
                if(!lineItem.isReturn) {
                    options.push({
                        text: lineItem.Product.name + ' ' + lineItem.ProductVariation.name,
                        id: lineItem.id
                    });
                }
            }
            this.lineItemSelect2Options.data = options;
        });

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        })

    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Add Custom Discount",
                modal: true,
                resizable: false,
                draggable: false,
                maxWidth: 800,
                maxHeight: 600,
                width: 600,
                buttons:[
                    {
                        text: 'Cancel',
                        "class": 'dialog-button-cancel',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideCustomDiscountModal();
                }
            });

        this.dialog = $dialog;

    }

    next(){
        this.error = "";
        this.negError = "";
        if(this.step == 'cart'){
            if(this.lineItemOrCart == 'line-item' && !this.selectedLineItemId){
                this.error = "If discounting line item, you must select a line item to discount";
                return;
            }else{
                this.step = 'type';
            }
        }else if(this.step == 'type'){
            this.step = 'amount';
        }else if(this.step == 'amount'){

            if(!this.amount){
                this.error = "Discount Amount cannot be blank.";
                return;
            }

            if (this.amount < 0) {
                this.negError = "Discount Amount cannot be negative.";
                return;
            }

            let discounts = this.calculateDiscounts();

            console.log(discounts);

            this.cartService.emitCustomDiscount(discounts);

            this.dialog.dialog('close')
        }
    }

    calculateDiscounts(){
        let discounts = [];

        if(this.lineItemOrCart == 'cart'){

            let totalDiscountAmount;
            if(this.type == 'dollar'){
                let cartTotal = this.store.taxesIncluded ? this.cart.total : this.cart.subtotal;
                if(this.dollarDiscountSelection == 'discount'){
                    totalDiscountAmount = this.amount;
                }else if(this.dollarDiscountSelection == 'target'){
                    totalDiscountAmount = cartTotal - this.amount;
                }else if(this.dollarDiscountSelection == 'target-no-tax'){
                    totalDiscountAmount = 0
                }

                for(let lineItem of this.cart.lineItems){

                    let proportion = lineItem.price / cartTotal;

                    let discountAmount;

                    if(this.dollarDiscountSelection != 'target-no-tax'){
                        discountAmount = proportion * totalDiscountAmount;
                    }else{

                        let taxes = this.cartService.allTaxes;


                        let taxRate = 0;
                        for(let tax of taxes){
                            if(lineItem.Product.ProductType.category == 'cannabis' && tax.appliesToCannabis || lineItem.Product.ProductType.category == 'non-cannabis' && tax.appliesToNonCannabis){
                                taxRate += tax.percent;
                            }
                        }

                        taxRate = taxRate / 100;


                        let priceTarget = proportion * this.amount;
                        let priceBeforeTax = priceTarget / (1 + taxRate);

                        discountAmount = lineItem.price - priceBeforeTax;

                    }

                    let discount = new Discount({
                        id: uuid.v4(),
                        version: 0,

                        name: 'Custom Discount',
                        code: undefined,

                        amountType: this.type,
                        amount: discountAmount,

                        minimumType: 'items',
                        minimum: 0,

                        maximum: undefined,

                        startDate: null,
                        endDate: null,

                        startTime: null,
                        endTime: null,

                        days: [],
                        patientType: 'all',
                        patientGroupId: undefined,
                        productTypeId: undefined,
                        productId: undefined,
                        packageId: undefined,
                        productVariationId: undefined,
                        lineItemId: lineItem.id,
                        supplierId: undefined,
                        isActive: true,
                        isAutomatic: true,
                        isCustom: true,
                        isOverride: false,
                        managerApproval: false,
                        thcType: 'all',
                        notes: this.notes
                    });

                    discounts.push(discount);


                }

            }else{
                totalDiscountAmount = this.amount;
                let discount = new Discount({
                    id: uuid.v4(),
                    version: 0,

                    name: 'Custom Discount',
                    code: undefined,

                    amountType: this.type,
                    amount: totalDiscountAmount,

                    minimumType: 'items',
                    minimum: 0,

                    maximum: undefined,

                    startDate: null,
                    endDate: null,

                    startTime: null,
                    endTime: null,

                    days: [],
                    patientType: 'all',
                    patientGroupId: undefined,
                    productTypeId: undefined,
                    productId: undefined,
                    packageId: undefined,
                    productVariationId: undefined,
                    lineItemId: undefined,
                    supplierId: undefined,
                    isActive: true,
                    isAutomatic: true,
                    isCustom: true,
                    isOverride: false,
                    managerApproval: false,
                    thcType: 'all',
                    notes: this.notes
                });

                discounts.push(discount);
            }

        }else{
            //Individual line item

            let discountAmount;
            if(this.type == 'dollar'){
                if(this.dollarDiscountSelection == 'discount'){
                    discountAmount = this.amount;
                }else if(this.dollarDiscountSelection == 'target'){
                    let lineItem;
                    for(let cartLineItem of this.cart.lineItems){
                        if(cartLineItem.id == this.selectedLineItemId){
                            lineItem = cartLineItem;
                        }
                    }

                    //Target means subtract amount from lineItem price
                    discountAmount = lineItem.price - this.amount;

                }else if(this.dollarDiscountSelection == 'target-no-tax'){

                    let lineItem;
                    for(let cartLineItem of this.cart.lineItems){
                        if(cartLineItem.id == this.selectedLineItemId){
                            lineItem = cartLineItem;
                        }
                    }

                    let taxes = this.cartService.allTaxes;


                    let taxRate = 0;
                    for(let tax of taxes){
                        if(lineItem.Product.ProductType.category == 'cannabis' && tax.appliesToCannabis || lineItem.Product.ProductType.category == 'non-cannabis' && tax.appliesToNonCannabis){
                            taxRate += tax.percent;
                        }
                    }

                    taxRate = taxRate / 100;

                    console.log(taxRate);
                    console.log(this.amount);

                    //priceBeforeTax + priceBeforeTax(taxRate) = targetAmount
                    //priceBeforeTax(1+taxRate) = targetAmount
                    //priceBeforeTax = targetAmount / (1 + taxRate)

                    let priceBeforeTax = this.amount / (1 + taxRate);

                    console.log(priceBeforeTax);

                    discountAmount = lineItem.price - priceBeforeTax;

                    console.log(discountAmount);

                }
            }else{
                discountAmount = this.amount;
            }

            let discount = new Discount({
                id: uuid.v4(),
                version: 0,

                name: 'Custom Discount',
                code: undefined,

                amountType: this.type,
                amount: discountAmount,

                minimumType: 'items',
                minimum: 0,

                maximum: undefined,

                startDate: null,
                endDate: null,

                startTime: null,
                endTime: null,

                days: [],
                patientType: 'all',
                patientGroupId: undefined,
                productTypeId: undefined,
                productId: undefined,
                packageId: undefined,
                productVariationId: undefined,
                lineItemId: this.selectedLineItemId,
                supplierId: undefined,
                isActive: true,
                isAutomatic: true,
                isCustom: true,
                isOverride: false,
                managerApproval: false,
                thcType: 'all',
                notes: this.notes
            });

            discounts.push(discount);
        }

        return discounts;

    }

}
