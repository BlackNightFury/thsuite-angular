import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Receipt} from "../../../models/receipt.model";
import {ReceiptService} from "../../../services/receipt.service";

@Component({
    selector: 'app-test-receipt',
    templateUrl: './test-receipt.component.html',
    styleUrls: [ './test-receipt.component.css' ]
})
export class TestReceiptComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'lineItems': true,
        'user': true,
        'drawer': true,
        'patient': true,
    };

    constructor(private receiptService: ReceiptService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.receiptService.get(id).subscribe(receipt => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.receiptService.resolveAssociationsLegacy(Object.assign({}, receipt)),
                        this.receiptService.resolveAssociations(Object.assign({}, receipt)),
                        this.receiptService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedReceiptLegacy, enrichedReceipt, enrichedReceiptScopes]) => {
                        console.log('legacyServiceResult', enrichedReceiptLegacy);
                        console.log('serviceResult', enrichedReceipt);
                        console.log('optionalServiceResult', enrichedReceiptScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedReceiptLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedReceipt, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedReceiptScopes, 4);

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