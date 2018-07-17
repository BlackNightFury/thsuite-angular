import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {PackageService} from "../../../services/package.service";
import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {SupplierService} from "../../../services/supplier.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import * as moment from 'moment';
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {didSet} from "../../../lib/decorators/property/didSet";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import {PreviousRouteService} from "../../../services/previous-route.service";
import {audit} from "rxjs/operator/audit";

export function didSetSelectedPackageId(newValue) {
    this.packageIdSource.next(newValue);
}

@Component({
    selector: 'app-inventory-index',
    templateUrl: './inventory-package.component.html'
})
export class InventoryPackageComponent implements OnInit, OnDestroy {

    public chartData: Array<Array<any>>;
    public chartOptions: any;

    public tableData: any[];

    public name: string;
    public units: string;

    public packageSelect2Options: Select2Options;
    @didSet(didSetSelectedPackageId) selectedPackageId: string;

    private packageIdSource: Subject<string> = new Subject();

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(private packageService: PackageService, private storeService: StoreService, private previousRouteService: PreviousRouteService) {
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/reports/inventory-package");

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store

            this.packageIdSource
                .switchMap(packageId => this.packageService.getPackageAudit(packageId))
                .subscribe(auditData => {
                    if (auditData) {
                        this.tableData = auditData.changes;
                        this.name = auditData.name;
                        this.units = auditData.units;
                    } else{
                        if (auditData == undefined) console.log("auditData is undefined.");
                    }
                });
        });

        this.chartOptions = {
            animation : {
                startup: true,
                duration: 500,
                easing: 'out'
            },
            chartArea : {height: '75%', width: '80%'},
            hAxis: {
                textStyle: { color: '#6e858c'}
            },
            height: 400,
            series: {
                0: {color: '#28bd8b'}
            },
            tooltip: {
                textStyle: { color: '#6e858c'},
                isHtml: true
            },
            vAxis: {
                textStyle: { color: '#6e858c'}
            }
        };

        CommonAdapter(this.packageService, 'id', 'Label')
            .then(PackageAdapter => {

                this.packageSelect2Options = {
                    ajax: {},
                    placeholder: 'Scan Barcode or Select',
                    allowClear: false
                };
                this.packageSelect2Options['dataAdapter'] = PackageAdapter;
            });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedPackageId = undefined;
        }
        this.packageIdSource.next(this.selectedPackageId);
    }

}
