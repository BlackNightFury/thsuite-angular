import {Component, OnInit} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs";
import {Subscription} from "rxjs/Subscription";

import {PackageService} from "../../../services/package.service";
import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {SupplierService} from "../../../services/supplier.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import * as moment from 'moment-timezone';
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DateRange} from "../../../lib/date-range";

@Component({
    selector: 'app-inventory-index',
    templateUrl: './inventory-index.component.html'
})

export class InventoryIndexComponent implements OnInit {

    public chartData: Array<Array<any>>;
    public chartOptions: any;

    tableData: Array<any>;
    _tableData: Array<any> = [];

    results: Observable<any>;

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

    packageSelect2Options: Select2Options;
    packageSelect2InitialValue: string[] = [];
    selectedPackageIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);


    // flags to show select dropdowns
    flags: {
        productId: boolean;
        productTypeId: boolean;
        packageId: boolean;
        supplierId: boolean;
        customDate: boolean;
    } = {
        productId: false,
        productTypeId: false,
        packageId: false,
        supplierId: false,
        customDate: false
    };

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(private packageService: PackageService,
                private productService: ProductService,
                private productTypeService: ProductTypeService,
                private supplierService: SupplierService,
                private storeService: StoreService) {
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {

        this.chartOptions = {
            animation: {
                startup: true,
                duration: 500,
                easing: 'out'
            },
            chartArea: {height: '75%', width: '80%'},
            hAxis: {
                textStyle: {color: '#6e858c'}
            },
            height: 400,
            series: {
                0: {color: '#28bd8b'}
            },
            tooltip: {
                textStyle: {color: '#6e858c'},
                isHtml: true
            },
            vAxis: {
                textStyle: {color: '#6e858c'}
            }
        };

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;

            //Initial values on page load
            this.selectedInventoryEntity = 'packageId';
            this.selectedViewType = 'stock';

            Observable.combineLatest(
                this.selectedViewTypeSource,
                this.selectedInventoryEntitySource,
                this.dateRangeSource,
                this.selectedProductTypeIdSource,
                this.selectedProductIdSource,
                this.selectedPackageIdSource,
                this.selectedSupplierIdSource,
                (viewType, inventoryEntity, timeFrame, productTypeId, productId, packageId, supplierId) => {
                    return {
                        viewType: viewType,
                        inventoryEntity: inventoryEntity,
                        timeZone: this.store.timeZone,
                        productTypeId: productTypeId,
                        productId: productId,
                        packageId: packageId,
                        supplierId: supplierId,
                        dates: {
                            start: timeFrame.startDate,
                            end: timeFrame.endDate
                        }
                    };
                }
            ).subscribe((terms) => {
                this.results = this.packageService.inventoryReport(terms);
                this.results.subscribe(data => {
                    let accessField;
                    let chartLabel;
                    let axisFormat;
                    let prefix;
                    if (this.selectedViewType == 'stock') {
                        accessField = 'inventory';
                        chartLabel = 'Quantity';
                        axisFormat = undefined;
                        prefix = '';
                    } else if (this.selectedViewType == 'value') {
                        accessField = 'value';
                        chartLabel = 'Value';
                        axisFormat = 'currency';
                        prefix = '$';
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
                    this.chartOptions.vAxis.format = axisFormat;
                    // Process data for chart
                    if (data.length) {
                        let dataPoint;

                        for (let i = 0; i < data.length; i++) {
                            dataPoint = [];

                            let dataValue = data[i];

                            const date = moment(dataValue.date).format('MM/DD/YY');
                            const value = dataValue[accessField];
                            let prev;
                            let change;
                            if (i == 0) {
                                change = 0;
                            } else {
                                prev = data[i - 1][accessField];
                                change = value - prev;
                            }

                            //Ugly commify
                            const tooltipValue = prefix + (value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));

                            dataPoint.push(date);
                            dataPoint.push(value);
                            dataPoint.push(`
                            <div style="padding: 15px; font-size: medium">
                            <b>${date}</b> <br />
                            <b>${chartLabel}: </b> ${tooltipValue}
                            </div>
                            `);

                            this.chartData.push(dataPoint);

                            this.tableData.push({
                                date: date,
                                dataValue: value,
                                change: change
                            });

                            this._tableData.push({
                                date: date,
                                dataValue: value,
                                change: change
                            });
                        }

                    } else {
                        this.chartData = undefined;
                        this.tableData = [];
                        this._tableData = [];
                    }

                });
            });
        });

        this.viewTypeSelect2Options = {
            placeholder: 'View Inventory...',
            data: [
                {
                    id: 'stock',
                    text: 'By Quantity'
                },
                {
                    id: 'value',
                    text: 'By Value'
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
                    id: 'packageId',
                    text: 'Package'
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
            CommonAdapter(this.packageService, 'id', 'Label'),
            CommonAdapter(this.supplierService, 'id', 'name'),
        ).toPromise()
            .then(([ProductAdapter, ProductTypeAdapter, PackageAdapter, SupplierAdapter]) => {

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


                this.packageSelect2Options = {
                    ajax: {},
                    placeholder: 'Package',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.packageSelect2Options['dataAdapter'] = PackageAdapter;
                this.packageSelect2InitialValue = [];

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

        return function (value1, value2) {
            //Need to return 1 or 0
            //Total row is always last
            if (value2.name == 'Total') return -1;
            if (value1.name == 'Total') return 1;

            let result;
            let sort1;
            let sort2;
            if (sortField == 'average') {
                //Need to compute separately
                sort1 = (value1['sum'] / value1['count']);
                sort2 = (value2['sum'] / value2['count']);
            } else if (typeof value1[sortField] == 'string') {

                sort1 = value1[sortField].toLowerCase();
                sort2 = value2[sortField].toLowerCase();

            } else {
                sort1 = value1[sortField];
                sort2 = value2[sortField];
            }

            result = (sort1 < sort2) ? -1 : (sort1 > sort2) ? 1 : 0;

            //One column has negative numbers, don't want empty strings sorting ahead of them
            if (sort1 == '') return 1;
            if (sort2 == '') return -1;

            return result * sortOrder;
        }
    }

    _sortBy: SortBy;

    get sortByModel(): SortBy {
        return this._sortBy;
    }

    set sortByModel(value: SortBy) {
        this._sortBy = value;
        if (!value) {
            this.tableData = [];
            this._tableData.forEach(row => {
                this.tableData.push(row);
            });
        } else {
            this.tableData.sort(this.dynamicSort(value));
        }
    }


    unsetAll() {
        this.selectedProduct = undefined;
        this.selectedProductType = undefined;
        this.selectedPackage = undefined;
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
            if (key != 'customDate') {
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

    private _selectedPackage: string;
    get selectedPackage() {
        return this._selectedPackage;
    }

    set selectedPackage(newValue: string) {
        this._selectedPackage = newValue;
        this.selectedPackageIdSource.next(newValue);
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
