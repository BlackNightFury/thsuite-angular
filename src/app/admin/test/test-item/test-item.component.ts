import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Item} from "../../../models/item.model";
import {ItemService} from "../../../services/item.service";

@Component({
    selector: 'app-test-item',
    templateUrl: './test-item.component.html',
    styleUrls: [ './test-item.component.css' ]
})
export class TestItemComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'productType': true,
        'packages': true,
        'supplier': true,
        'store': true,
    };

    constructor(private itemService: ItemService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.itemService.get(id).subscribe(item => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.itemService.resolveAssociationsLegacy(Object.assign({}, item)),
                        this.itemService.resolveAssociations(Object.assign({}, item)),
                        this.itemService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedItemLegacy, enrichedItem, enrichedItemScopes]) => {
                        console.log('legacyServiceResult', enrichedItemLegacy);
                        console.log('serviceResult', enrichedItem);
                        console.log('optionalServiceResult', enrichedItemScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedItemLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedItem, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedItemScopes, 4);

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