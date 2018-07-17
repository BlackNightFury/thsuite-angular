import {Component, Input, OnInit} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {PosCartService} from "../../services/pos-cart.service";
import {ObjectObservable} from "../../lib/object-observable";
import {IProductVariation} from "../../models/interfaces/product-variation.interface";

@Component({
    selector: 'app-product-card',
    templateUrl: './product-card.component.html'
})
export class ProductCardComponent implements OnInit {

    @Input() productVariation: IProductVariation;

    constructor(sanitizer: DomSanitizer, private cartService: PosCartService) {

    }

    ngOnInit() {
    }


    onAddToCart() {
        this.cartService.addProductVariationToCart(this.productVariation);
    }

}
