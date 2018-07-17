import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {PackageService} from "../../../services/package.service";
import {ItemService} from "../../../services/item.service";
import {PurchaseOrderService} from "../../../services/purchase-order.service";
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

export function didSetSelectedItemId(newValue) {
    this.itemIdSource.next(newValue);
}

@Component({
    selector: 'app-inventory-index',
    templateUrl: './inventory-non-thc-po.component.html'
})
export class InventoryNonTHCPOComponent implements OnInit, OnDestroy {

    public chartData: Array<Array<any>>;
    public chartOptions: any;

    public tableData: any[];

    public name: string;
    public units: string;

    public itemSelect2Options: Select2Options;
    @didSet(didSetSelectedItemId) selectedItemId: string;

    private itemIdSource: Subject<string> = new Subject();

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(private purchaseOrderService: PurchaseOrderService, private itemService: ItemService, private packageService: PackageService, private storeService: StoreService, private previousRouteService: PreviousRouteService) {
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/reports/inventory-non-thc-po");

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store

            this.itemIdSource
                .switchMap(itemId => this.purchaseOrderService.auditByItemId(itemId))
                .subscribe(auditData => {
                    console.log('This is the purchase order', auditData)
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

        CommonAdapter(this.itemService, 'id', 'name', { cannabisCategory: 'non-cannabis' })
            .then(ItemAdapter => {

                this.itemSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Item',
                    allowClear: false
                };
                this.itemSelect2Options['dataAdapter'] = ItemAdapter;
            });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedItemId = undefined;
        }
        this.itemIdSource.next(this.selectedItemId);
    }

}
