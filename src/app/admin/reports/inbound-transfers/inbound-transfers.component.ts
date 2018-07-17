import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable, BehaviorSubject, Subscription} from "rxjs";

import {TransferService} from "../../../services/transfer.service";
import {ITransfer} from "../../../models/interfaces/transfer.interface";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {SupplierService} from "../../../services/supplier.service";

import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import * as moment from 'moment-timezone';
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DateRange} from "../../../lib/date-range";

@Component({
    selector: 'app-inbound-transfers-index',
    templateUrl: "./inbound-transfers.component.html"
})

export class InboundTransfersComponent implements OnInit, OnDestroy {

    public chartData: Array<Array<any>>;
    public chartOptions: any;
    tableData: Array<any>;
    _tableData: Array<any> = [];

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    selectedViewTypeSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    viewTypeSelect2Options: Select2Options;

    selectedInventoryEntitySource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    inventoryEntitySelect2Options: Select2Options;

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options: Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    typeUndefined: boolean = false;

    // flags to show select dropdowns
    flags: {
        productId: boolean;
        productTypeId: boolean;
        supplierId: boolean;
        customDate: boolean;
    } = {
        productId: false,
        productTypeId: false,
        supplierId: false,
        customDate: false
    };

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(
        private transferService: TransferService,
        private productService: ProductService,
        private productTypeService: ProductTypeService,
        private supplierService: SupplierService,
        private storeService: StoreService
    ){

    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {

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
                gridlines: { count: 10},
                textStyle: { color: '#6e858c'}
            }
        };

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;

            //Initial values on page load
            this.selectedViewType = 'quantity';

            Observable.combineLatest(
                this.selectedViewTypeSource,
                this.selectedInventoryEntitySource,
                this.selectedProductTypeIdSource,
                this.selectedProductIdSource,
                this.selectedSupplierIdSource,
                this.dateRangeSource,
                (viewType, inventoryEntity, productTypeId, productId, supplierId, dateRange) => {
                    return {
                        viewType: viewType,
                        inventoryEntity: inventoryEntity,
                        productTypeId: productTypeId,
                        productId: productId,
                        supplierId: supplierId,
                        dates: {
                            start: dateRange.startDate,
                            end: dateRange.endDate
                        },
                        timeZone: store.timeZone
                    };
                }
            ).subscribe((terms) => {
                this.transferService.inboundReportData(terms)
                    .then(data => {
                        let chartLabel;
                        this.typeUndefined = false;
                        if (this.selectedViewType == 'quantity') {
                            chartLabel = 'Quantity';
                        } else if (this.selectedViewType == 'volume') {
                            chartLabel = 'Package Count';
                        }

                        this.chartData = [
                            [
                                {label: 'Date', type: 'string'},
                                {label: chartLabel, type: 'number'},
                                {type: 'string', role: 'tooltip', 'p': {'html': true}}
                            ]
                        ];
                        this.tableData = [];
                        this._tableData = [];
                        // Process data for chart
                        if (data.length) {
                            let dataPoint;

                            for (let i = 0; i < data.length; i++) {
                                dataPoint = [];

                                let dataValue = data[i];

                                const date = moment(dataValue.date).format('MM/DD/YY');
                                let value = 0;

                                Object.keys(dataValue.value).forEach(key => {

                                    if(key != "type") {
                                        value += dataValue.value[key];
                                    }

                                });

                                let tooltipValue = value.toString();
                                if(this.selectedViewType == 'quantity') tooltipValue = value.toFixed(2);

                                dataPoint.push(date);
                                dataPoint.push(value);

                                let quantityString;

                                if(dataValue.value.count != undefined){
                                    quantityString = ' ' + dataValue.value.count;
                                }else{
                                    quantityString = ' ' + dataValue.value.Grams + ' g <br /> ' + dataValue.value.Each + ' ea';
                                }

                                let tooltip = `
                                <div style="padding: 15px; font-size: medium">
                                    <b>${date}</b> <br />
                                    <div style="display: flex;">
                                        <b>${chartLabel}: &nbsp; </b>${quantityString}</div>
                                    </div>
                                </div>
                                `;

                                dataPoint.push(tooltip);

                                if(dataValue.value.type === undefined){
                                    this.typeUndefined = true;
                                }

                                this.chartData.push(dataPoint);


                                this.tableData.push({
                                    date: date,
                                    value: dataValue.value,
                                });

                                this._tableData.push({
                                    date: date,
                                    value: dataValue.value,
                                });
                            }

                        } else {
                            this.chartData = undefined;
                            this.tableData = [];
                            this._tableData = [];
                        }

                    }).catch(err => {
                        console.log('err: ');
                        console.log(err);
                });
            });
        });

        this.viewTypeSelect2Options = {
            placeholder: 'View Transfers...',
            data: [
                {
                    id: 'quantity',
                    text: 'By Package Quantity'
                },
                {
                    id: 'volume',
                    text: 'By Package Count'
                }
            ]
        };

        this.inventoryEntitySelect2Options = {
            placeholder: 'Inventory Entity',
            allowClear: true,
            data: [
                {
                    id: 'productId',
                    text: 'Product'
                },
                {
                    id: 'productTypeId',
                    text: 'Product Type'
                },
                {
                    id: 'supplierId',
                    text: 'Supplier'
                }
            ]
        };


        Observable.combineLatest(
            CommonAdapter(this.productService, 'id', 'name'),
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.supplierService, 'id', 'name'),
        ).toPromise()
            .then(([ProductAdapter, ProductTypeAdapter, SupplierAdapter]) => {

                this.productSelect2Options = {
                    ajax: {},
                    placeholder: 'Product',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productSelect2Options['dataAdapter'] = ProductAdapter;
                this.productSelect2InitialValue = [];


                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];

                this.supplierSelect2Options = {
                    ajax: {},
                    placeholder: 'Supplier',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;
                this.supplierSelect2InitialValue = [];
            });

    }

    dynamicSort(property: SortBy) {

        let sortField = property.sortBy;
        let sortOrder = property.direction == 'asc' ? 1 : -1;

        return function(value1, value2) {
            //Need to return 1 or 0
            //Total row is always last
            if(value2.name == 'Total') return -1;
            if(value1.name == 'Total') return 1;

            let result;
            let sort1;
            let sort2;
            if (sortField == 'unit'){
                //Need to compute separately
                //Find the thing that is non-zero
                if(value1.value.count != undefined){
                    sort1 = value1.value.count;
                    sort2 = value2.value.count;
                }else{
                    if((value1.value.Each == 0 && value1.value.Grams != 0) || (value2.value.Each == 0 && value2.value.Grams != 0)){
                        //This is measured in Grams
                        sort1 = value1.value.Grams;
                        sort2 = value2.value.Grams;
                    }else if((value1.value.Each != 0 && value1.value.Grams == 0) || (value2.value.Each != 0 && value2.value.Grams == 0)){
                        //This is measured in Each
                        sort1 = value1.value.Each;
                        sort2 = value2.value.Each;
                    }else{
                        //They are both 0 -- doesn't matter how they are sorted
                        sort1 = 0;
                        sort2 = 0;
                    }
                }
            }else{
                sort1 = value1['value'][sortField];
                sort2 = value2['value'][sortField];
            }

            result = (sort1 < sort2) ? -1 : (sort1 > sort2) ? 1 : 0;


            return result * sortOrder;
        }
    }

    _sortBy: SortBy;
    get sortByModel(): SortBy {
        return this._sortBy;
    }
    set sortByModel(value: SortBy) {
        this._sortBy = value;
        if(!value){
            this.tableData = [];
            this._tableData.forEach(row => {
                this.tableData.push(row);
            });
        }else{
            this.tableData.sort(this.dynamicSort(value));
        }
    }


    unsetAll() {
        this.selectedProduct = undefined;
        this.selectedProductType = undefined;
        this.selectedSupplier = undefined;
    }

    private _selectedInventoryEntity: string;
    get selectedInventoryEntity() {
        return this._selectedInventoryEntity;
    }
    set selectedInventoryEntity(newValue: string) {
        // Need to unset other filters when inventory entity changes
        this.unsetAll();
        this._selectedInventoryEntity = newValue;
        // Update which dropdown is shown
        Object.keys(this.flags).forEach(key => {
            if(key != 'customDate'){
                this.flags[key] = (key == newValue);
            }
        });
        this.selectedInventoryEntitySource.next(newValue);
    }

    private _selectedViewType: string;
    get selectedViewType() {
        return this._selectedViewType;
    }
    set selectedViewType(newValue: string) {
        this._selectedViewType = newValue;
        this.selectedViewTypeSource.next(newValue);
    }

    private _selectedProduct: string;
    get selectedProduct() {
        return this._selectedProduct;
    }
    set selectedProduct(newValue: string) {
        this._selectedProduct = newValue;
        this.selectedProductIdSource.next(newValue);
    }

    private _selectedProductType: string;
    get selectedProductType() {
        return this._selectedProductType;
    }
    set selectedProductType(newValue: string) {
        this._selectedProductType = newValue;
        this.selectedProductTypeIdSource.next(newValue);
    }

    private _selectedSupplier: string;
    get selectedSupplier() {
        return this._selectedSupplier;
    }
    set selectedSupplier(newValue: string) {
        this._selectedSupplier = newValue;
        this.selectedSupplierIdSource.next(newValue);
    }

}
