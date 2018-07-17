import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Barcode} from "../../../models/barcode.model";
import {BarcodeService} from "../../../services/barcode.service";

@Component({
    selector: 'app-test-barcode',
    templateUrl: './test-barcode.component.html',
    styleUrls: [ './test-barcode.component.css' ]
})
export class TestBarcodeComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'productVariation': true,
        'items': true,
        'packages': true,
    };

    constructor(private barcodeService: BarcodeService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.barcodeService.get(id).subscribe(barcode => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.barcodeService.getAssociated(id),
                        this.barcodeService.getAssociated(id, Object.keys(this.scopes)),
                        this.barcodeService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedBarcodeLegacy, enrichedBarcode, enrichedBarcodeScopes]) => {
                        console.log('legacyServiceResult', enrichedBarcodeLegacy);
                        console.log('serviceResult', enrichedBarcode);
                        console.log('optionalServiceResult', enrichedBarcodeScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedBarcodeLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedBarcode, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedBarcodeScopes, 4);

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