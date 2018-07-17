import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {Subscription} from "rxjs/Subscription";

import {PackageService} from "../../../services/package.service";
import {ITransaction} from "../../../models/interfaces/transaction.interface";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import * as moment from 'moment-timezone';
import * as formatCurrency from 'format-currency';
import {didSet} from "../../../lib/decorators/property/didSet";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {SupplierService} from "../../../services/supplier.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {ProductService} from "../../../services/product.service";
import {SlimLoadingBarComponent, SlimLoadingBarService} from "ng2-slim-loading-bar";
import {InventoryReportService} from "../../../services/report-services/inventory-report.service";

import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetSelectedProductId(newValue) {
    this.selectedProductIdSource.next(newValue);
}

export function didSetSelectedProductTypeId(newValue) {
    this.selectedProductTypeIdSource.next(newValue);
}

export function didSetSelectedSupplierId(newValue) {
    this.selectedSupplierIdSource.next(newValue);
}

export function didSetReportDate(newValue) {
    this.selectedDateSource.next( moment(newValue, 'MM-DD-YYYY').tz(this.store.timeZone).endOf('day').utc() );
}

export function didSetCannabisOptions(newValue) {
    this.toggleCannabisSource.next(newValue);
}

export function didSetPage(newValue) {

    if (this.chartData) {
        this.chartDataPage = this.chartData.slice(newValue * 10, newValue * 10 + 10);
        document.body.scrollTop = 0;
    }
}

@Component({
    selector: 'app-inventory-breakdown',
    templateUrl: './inventory-breakdown.component.html',
    styleUrls: [ './inventory-breakdown.component.css' ]
})
export class InventoryBreakdownComponent implements OnInit, OnDestroy {

    public chartData: any[];
    public unsortedChartData: any[];
    public chartOptions: any;

    results: Observable<any>;
    tableData: any[];

    chartDataPage: any[];

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options: Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    selectedReportType = 'package';
    selectedReportTypeSource: BehaviorSubject<string> = new BehaviorSubject('package');

    selectedDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    selectedSearchTermSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    selectedSearchTerm: string = undefined;

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    @didSet(didSetSelectedProductId) selectedProductId: string;

    @didSet(didSetSelectedProductTypeId) selectedProductTypeId: string;

    @didSet(didSetSelectedSupplierId) selectedSupplierId: string;

    @didSet(didSetReportDate) reportDate: Date;

    @didSet(didSetCannabisOptions) cannabisOptions: 'all'| 'cannabis' | 'non-cannabis';

    reportTypeOptions = {
        data: [
            {
                text: 'Package',
                id: 'package'
            },
            {
                text: 'Product',
                id: 'product'
            },
            {
                text: 'Item',
                id: 'item'
            }
        ]
    };

    toggleCannabisOptions: Array<Object> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'THC',
            value: 'cannabis'
        },
        {
            label: 'Non-THC',
            value: 'non-cannabis'
        }
    ];

    toggleCannabisSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    @didSet(didSetPage) page = 0;

    get numPages() {
        return this.chartData ? Math.ceil(this.chartData.length / 10) : 0;
    }

    loadingBarService: SlimLoadingBarService;

    constructor(
        private supplierService: SupplierService,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        loadingBarService: SlimLoadingBarService,
        private inventoryReportService: InventoryReportService,
        private storeService: StoreService,
        private previousRouteService: PreviousRouteService
    ) {
        this.loadingBarService = loadingBarService;
    }

    getLatestArgs() {
        return Observable.combineLatest(
            this.selectedProductTypeIdSource,
            this.selectedSupplierIdSource,
            this.selectedProductIdSource,
            this.selectedDateSource,
            this.selectedSearchTermSource,
            this.toggleCannabisSource,
            this.selectedReportTypeSource,
            (productTypeId, supplierId, productId, date, searchTerm, cannabisFilter, reportType) => {
                return {
                    productTypeId: productTypeId,
                    supplierId: supplierId,
                    productId: productId,
                    date: date,
                    searchTerm: searchTerm,
                    cannabisFilter: cannabisFilter,
                    reportType
                };
            }
        );
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/reports/inventory-breakdown");

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
            this.reportDate = moment().tz(store.timeZone).format('MM-DD-YYYY');

            this.getLatestArgs()
            .debounceTime(100)
                .do(() => {
                    this.loadingBarService.interval = 30;
                    this.loadingBarService.start();
                }).subscribe(reportArgs => {

                this.inventoryReportService.inventoryBreakdownReport(reportArgs)
                    .then(data => {

                        const num = (n) => Number(n) || 0
                        this.chartData = data.map(data => ({
                            ...data,
                            quantityG: data.UnitOfMeasureAbbreviation === 'g' ? num(data.Quantity) : 0,
                            quantityEA: data.UnitOfMeasureAbbreviation === 'ea' ? num(data.Quantity) : 0,
                            profit: num(data.valuePerUnit) - num(data.costPerUnit),
                            totalCost: num(data.costPerUnit) * num(data.Quantity),
                            totalProfit: (num(data.valuePerUnit) - num(data.costPerUnit)) * num(data.Quantity)
                        }));
                        this.unsortedChartData = data.slice();
                        this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);

                        this.loadingBarService.complete();
                    });
            });
        });

        Observable.combineLatest(
            CommonAdapter(this.supplierService, 'id', supplier => `<div class="flex-row"><div class="flex-col-50 align-left">${supplier.name}</div><div class="flex-col-50 align-right">${supplier.licenseNumber}</div>`),
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.productService, 'id', 'name')
        ).toPromise()
            .then(([SupplierAdapter, ProductTypeAdapter, ProductAdapter]) => {

                this.supplierSelect2Options = {
                    ajax: {},
                    placeholder: 'Supplier',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;
                this.supplierSelect2InitialValue = [];


                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];


                this.productSelect2Options = {
                    ajax: {},
                    placeholder: 'Product',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productSelect2Options['dataAdapter'] = ProductAdapter;
                this.productSelect2InitialValue = [];

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
                format: 'currency',
                gridlines: { count: 10},
                textStyle: { color: '#6e858c'}
            }
        };

        this.tableData = [];

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedProductId = '';
            this.selectedProductTypeId = '';
            this.selectedSupplierId = '';
            this.cannabisOptions = 'all';
        }
        this.selectedProductIdSource.next(this.selectedProductId);
        this.selectedProductTypeIdSource.next(this.selectedProductTypeId);
        this.selectedSupplierIdSource.next(this.selectedSupplierId);
        this.toggleCannabisSource.next(this.cannabisOptions);
    }

    search(term: string) {
        this.selectedSearchTerm = term;
        this.selectedSearchTermSource.next(term);
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }

    onClickExport(report) {
        const dateString = moment.utc(this.reportDate).format();
        const args = {
            productTypeId: this.selectedProductTypeId,
            supplierId: this.selectedSupplierId,
            productId: this.selectedProductId,
            date: dateString,
            searchTerm: this.selectedSearchTerm,
           report: report
        };

        this.getLatestArgs().take(1)
        .subscribe(args => {
            this.inventoryReportService.inventoryBreakdownReportExport(args)
            .then( url => {
                $("<iframe/>").attr({
                    src: url.Location,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");
            } )
        })
    }

    dynamicSort(property: SortBy) {
        console.log(property);
        let sortField = property.sortBy;
        let sortOrder = property.direction == 'asc' ? 1 : -1;

        return function(value1, value2) {
            //Need to return 1 or 0
            //Total row is always last
            if(value2.type == 'Total') return -1;
            if(value1.type == 'Total') return 1;

            let result;
            let sort1;
            let sort2;
            if (sortField == 'costPerUnit'){
                //Need to compute separately
                sort1 = (value1['wholesalePrice']/value1['ReceivedQuantity']);
                sort2 = (value2['wholesalePrice']/value2['ReceivedQuantity']);
            } else if(sortField == 'valuePerUnit'){
                sort1 = (value1['value']/value1['sold']);
                sort2 = (value2['value']/value2['sold']);
            } else if(sortField == 'potentialProfit'){
                sort1 = (value1['TotalPrice']/value1['sold']);
                sort2 = (value2['TotalPrice']/value2['sold']);
            } else if(typeof value1[sortField] == 'string') {

                sort1 = value1[sortField].toLowerCase();
                sort2 = value2[sortField].toLowerCase();

            }else{
                sort1 = value1[sortField];
                sort2 = value2[sortField];
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
        console.log("sort!");
        this._sortBy = value;
        if (!value) {
            this.chartData = this.unsortedChartData.slice();
            this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);
        } else {
            this.chartData.sort(this.dynamicSort(value));
            this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);
        }
    }

    onReportTypeChanged() {
        this.selectedSearchTermSource.next('');
        this.selectedReportTypeSource.next(this.selectedReportType);
    }
}
