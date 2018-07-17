import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Package} from "../../../models/package.model";
import {PackageService} from "../../../services/package.service";

@Component({
    selector: 'app-test-package',
    templateUrl: './test-package.component.html',
    styleUrls: [ './test-package.component.css' ]
})
export class TestPackageComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'item': true,
        'supplier': true,
        'adjustments': true,
        'priceAdjustments': true,
        'deliveryPackage': true,
    };

    constructor(private packageService: PackageService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.packageService.get(id).subscribe(package_ => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.packageService.resolveAssociationsLegacy(Object.assign({}, package_)),
                        this.packageService.resolveAssociations(Object.assign({}, package_)),
                        this.packageService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedPackageLegacy, enrichedPackage, enrichedPackageScopes]) => {
                        console.log('legacyServiceResult', enrichedPackageLegacy);
                        console.log('serviceResult', enrichedPackage);
                        console.log('optionalServiceResult', enrichedPackageScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedPackageLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedPackage, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedPackageScopes, 4);

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