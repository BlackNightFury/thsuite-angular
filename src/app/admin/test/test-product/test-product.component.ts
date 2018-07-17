import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Product} from "../../../models/product.model";
import {ProductService} from "../../../services/product.service";

@Component({
    selector: 'app-test-product',
    templateUrl: './test-product.component.html',
    styleUrls: [ './test-product.component.css' ]
})
export class TestProductComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'productType': true,
        'productVariations': true,
        'item': true,
        'pricingTier': true,
        'store': true
    };

    constructor(private productService: ProductService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.productService.get(id).subscribe(product => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.productService.resolveAssociationsLegacy(Object.assign({}, product)),
                        this.productService.resolveAssociations(Object.assign({}, product)),
                        this.productService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedProductLegacy, enrichedProduct, enrichedProductScopes]) => {
                        console.log('legacyServiceResult', enrichedProductLegacy);
                        console.log('serviceResult', enrichedProduct);
                        console.log('optionalServiceResult', enrichedProductScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedProductLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedProduct, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedProductScopes, 4);

                        this.serviceResultsMatches = (this.legacyServiceResult === this.serviceResult);
                    });
                });
            }
        });
    }

    changedId(val) {
        this.dataSource.next(val);
    }

    changedScope() {
        this.dataSource.next(this.id);
    }

    get scopeKeys() {
        return Object.keys(this.scopes);
    }

    safeStringify(obj, spaces = 0) {
        let cache = [];

        return JSON.stringify(obj, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }

            return value;
        }, spaces);
    }
}