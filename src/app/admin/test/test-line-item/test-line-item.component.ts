import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {LineItem} from "../../../models/line-item.model";
import {LineItemService} from "../../../services/line-item.service";

@Component({
    selector: 'app-test-line-item',
    templateUrl: './test-line-item.component.html',
    styleUrls: [ './test-line-item.component.css' ]
})
export class TestLineItemComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'transactions': true,
        'barcode': true,
        'product': true,
        'productVariation': true,
        'discount': true
    };

    constructor(private lineItemService: LineItemService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.lineItemService.get(id).subscribe(lineItem => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.lineItemService.resolveAssociationsLegacy(Object.assign({}, lineItem)),
                        this.lineItemService.resolveAssociations(Object.assign({}, lineItem)),
                        this.lineItemService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedLineItemLegacy, enrichedLineItem, enrichedLineItemScopes]) => {
                        console.log('legacyServiceResult', enrichedLineItemLegacy);
                        console.log('serviceResult', enrichedLineItem);
                        console.log('optionalServiceResult', enrichedLineItemScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedLineItemLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedLineItem, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedLineItemScopes, 4);

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