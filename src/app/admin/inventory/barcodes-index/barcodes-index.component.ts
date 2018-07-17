import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {Component, Injector, OnInit} from "@angular/core";
import {IBarcode} from "../../../models/interfaces/barcode.interface";
import {BarcodeService} from "../../../services/barcode.service";
import {ProductVariationService} from "../../../services/product-variation.service";
import {IProductVariation} from "../../../models/interfaces/product-variation.interface";
import * as formatCurrency from 'format-currency';

import {didSet} from "../../../lib/decorators/property/didSet";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetTHCToggle(newValue) {
    this.toggleTHCSource.next(newValue);
}

@Component({
    selector: 'app-barcodes-index',
    templateUrl: './barcodes-index.component.html'
})
export class BarcodesIndexComponent extends ObjectsIndexComponent<IBarcode> implements OnInit{

    @didSet(didSetTHCToggle) toggleTHC: 'all'| 'THC' | 'non-THC';

    toggleTHCOptions: Array<Object> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'THC',
            value: 'cannabis'
        },
        {
            label: 'Non-THC',
            value: 'non-cannabis'
        }
    ];

    toggleTHCSource: BehaviorSubject<string> = new BehaviorSubject('all');

    constructor(injector: Injector,
                private barcodeService: BarcodeService, private previousRouteService: PreviousRouteService){
        super(injector, barcodeService);
    }

    ngOnInit(){
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/inventory/barcodes-index");

        super.ngOnInit();

        this.toggleTHCSource.asObservable().subscribe(toggleTHC => {
            this.extraFilters.next({toggleTHC: toggleTHC});
        });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
                this.toggleTHC = 'all';
        }
        this.toggleTHCSource.next(this.toggleTHC);
    }

    onRowClick(event, barcode: IBarcode) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewBarcode(barcode);

    }

    productVariationPrice(productVariation: IProductVariation){
        if(productVariation.Product.inventoryType == 'weight') {
            if(productVariation.Product.PricingTier) {
                let pricePer = ProductVariationService.getPriceFromTier(productVariation, productVariation.Product.PricingTier);
                return formatCurrency(pricePer * productVariation.quantity, {format: '%s%v', code: 'USD', symbol: '$'});
            }else{
                return "No Pricing Tier";
            }
        }else{
            return formatCurrency(productVariation.price, {format: '%s%v', code: 'USD', symbol: '$'});
        }
    }

    createBarcode(){
        this.barcodeService.create();
    }

    listBarcodes(){
        this.barcodeService.list();
    }

    viewBarcode(barcode: IBarcode){
        this.barcodeService.view(barcode);
    }

}
