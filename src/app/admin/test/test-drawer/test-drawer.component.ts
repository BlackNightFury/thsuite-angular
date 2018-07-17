import {Component, OnInit} from "@angular/core";
import {Observable, Subscription, Subject} from "rxjs";
import {Drawer} from "../../../models/drawer.model";
import {DrawerService} from "../../../services/drawer.service";

@Component({
    selector: 'app-test-drawer',
    templateUrl: './test-drawer.component.html',
    styleUrls: [ './test-drawer.component.css' ]
})
export class TestDrawerComponent implements OnInit {

    id: string = '';
    legacyServiceResult: string = '';
    serviceResult: string = '';
    optionalServiceResult: string;
    serviceResultsMatches: boolean;
    dataSource;

    scopes = {
        'receipts': true,
        'user': true,
        'log': true,
        'device': true,
    };

    constructor(private drawerService: DrawerService) {
    }

    ngOnInit(){
        this.dataSource = new Subject();

        this.dataSource.debounceTime(300).subscribe(id => {
            this.legacyServiceResult = '';
            this.serviceResult = '';
            this.optionalServiceResult = '';

            if (id) {
                this.drawerService.get(id).subscribe(drawer => {

                    const selectedScopes = Object.keys(this.scopes).filter(scope => this.scopes[scope]);

                    Observable.combineLatest(
                        this.drawerService.resolveAssociationsLegacy(Object.assign({}, drawer)),
                        this.drawerService.resolveAssociations(Object.assign({}, drawer)),
                        this.drawerService.getAssociated(id, selectedScopes)
                    ).subscribe(([enrichedDrawerLegacy, enrichedDrawer, enrichedDrawerScopes]) => {
                        console.log('legacyServiceResult', enrichedDrawerLegacy);
                        console.log('serviceResult', enrichedDrawer);
                        console.log('optionalServiceResult', enrichedDrawerScopes);

                        this.legacyServiceResult = this.safeStringify(enrichedDrawerLegacy, 4);
                        this.serviceResult = this.safeStringify(enrichedDrawer, 4);
                        this.optionalServiceResult = this.safeStringify(enrichedDrawerScopes, 4);

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