import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Transaction} from "../../../models/transaction.model";
import {TransactionService} from "../../../services/transaction.service";

@Component({
    selector: 'app-test-transaction',
    templateUrl: './test-transaction.component.html',
    styleUrls: [ './test-transaction.component.css' ]
})
export class TestTransactionComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'package': true,
        'product': true,
        'productVariation': true,
        'item': true,
        'transactionTaxes': true,
        'discount': true,
    };

    constructor(private transactionService: TransactionService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.transactionService.get(id).subscribe(transaction => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.transactionService.resolveAssociationsLegacy(Object.assign({}, transaction)),
                        this.transactionService.resolveAssociations(Object.assign({}, transaction)),
                        this.transactionService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedTransactionLegacy, enrichedTransaction, enrichedTransactionScopes]) => {
                        console.log('legacyServiceResult', enrichedTransactionLegacy);
                        console.log('serviceResult', enrichedTransaction);
                        console.log('optionalServiceResult', enrichedTransactionScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedTransactionLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedTransaction, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedTransactionScopes, 4);

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