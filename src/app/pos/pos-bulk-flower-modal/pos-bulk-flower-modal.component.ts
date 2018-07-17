import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";
import {UserService} from "../../services/user.service";
import {IProductVariation} from "../../models/interfaces/product-variation.interface";
import {Subscription} from "rxjs/Subscription";
import {IPackage} from "../../models/interfaces/package.interface";
import {IBarcode} from "../../models/interfaces/barcode.interface";

declare const $: any;
@Component({
    selector: 'app-pos-bulk-flower-modal',
    templateUrl: './pos-bulk-flower-modal.component.html'
})
export class PosBulkFlowerModalComponent implements OnInit, AfterViewInit, OnDestroy{
    protected dialog;

    error: string;

    variationSubscription: Subscription;

    productVariation: IProductVariation;
    packages: IPackage[];
    barcode: IBarcode;

    weight: number;

    update: boolean = false;

    constructor(private element: ElementRef, private cartService: PosCartService, private userService: UserService){

    }

    ngOnInit(){

        this.variationSubscription = this.cartService.bulkFlowerInformationEmitted.subscribe(({productVariation, packages, barcode}) => {
            this.productVariation = productVariation;
            this.packages = packages;
            this.barcode = barcode;
            let lineItemKey = `${productVariation.id}-${barcode.id}`;
            let lineItemQuantity = this.cartService.getLineItemQuantity(lineItemKey);
            if(lineItemQuantity){
                this.weight = lineItemQuantity;
                this.update = true;
            }
        });

    }

    ngAfterViewInit(){

        let $dialog = $(this.element.nativeElement);

        $dialog
            .dialog({
                title: "Bulk Flower Weight",
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
                        text: this.update ? "Update Weight": "Add to Cart",
                        click: () => {
                            if(this.validate()){
                                this.cartService.addBulkProductVariationToCart(this.productVariation, this.packages, this.barcode.id, this.weight);
                                $dialog.dialog('close');
                            }
                        }
                    }
                ],
                beforeClose: (evt, ui) => {
                    this.cartService.hideBulkFlowerModal();
                }
            });

        this.dialog = $dialog;

    }

    ngOnDestroy(){
        this.variationSubscription && this.variationSubscription.unsubscribe();
    }


    validate(){
        return !!this.weight;
    }

}

