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
import {ReplaySubject} from "rxjs/ReplaySubject";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {UserService} from "../../../services/user.service";
import {ProductService} from "../../../services/product.service";
import {SlimLoadingBarComponent, SlimLoadingBarService} from "ng2-slim-loading-bar";
import {InventoryReportService} from "../../../services/report-services/inventory-report.service";
import {DateRange} from "../../../lib/date-range";
import {ReceiptService} from "../../../services/receipt.service";

import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetSelectedProductId(newValue){

    this.selectedProductIdSource.next(newValue);

}

export function didSetSelectedEmployeeId(newValue){

    this.selectedEmployeeIdSource.next(newValue);

}

export function didSetPage(newValue) {

    if(this.chartData) {
        this.chartDataPage = this.chartData.slice(newValue * 10, newValue * 10 + 10);
        document.body.scrollTop = 0;
    }

}

@Component({
    selector: 'app-inventory-daily',
    templateUrl: './inventory-daily.component.html'
})
export class InventoryDailyComponent implements OnInit, OnDestroy {

    public chartData: any[];
    public unsortedChartData: any[];
    public chartOptions: any;

    results: Observable<any>;
    tableData: any[];

    reportDate;

    chartDataPage: any[];

    employeeSelect2Options: Select2Options;
    employeeSelect2InitialValue: string[] = [];
    selectedEmployeeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options: Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    selectedDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    selectedSearchTermSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    selectedSearchTerm: string = undefined;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    @didSet(didSetSelectedProductId) selectedProductId: string;

    @didSet(didSetSelectedEmployeeId) selectedEmployeeId: string;

    @didSet(didSetPage) page : number = 0;

    get numPages() {
        return this.chartData ? Math.ceil(this.chartData.length / 10) : 0
    }

    loadingBarService: SlimLoadingBarService;

    constructor(
        private userService: UserService,
        private productService: ProductService,
        loadingBarService: SlimLoadingBarService,
        private inventoryReportService: InventoryReportService,
        private storeService: StoreService,
        private receiptService: ReceiptService,
        private previousRouteService: PreviousRouteService
    ){
        this.loadingBarService = loadingBarService;
    }

    getLatestArgs() {
        return Observable.combineLatest(
            this.selectedEmployeeIdSource,
            this.selectedProductIdSource,
            this.dateRangeSource,
            this.selectedSearchTermSource,
            this.receiptService.refreshEmitted,
            (userId, productId, date, searchTerm) => {
                console.log("EMITTED");
                return {
                    userId: userId,
                    productId: productId,
                    date: {
                        startDate: moment(date.startDate, 'MM-DD-YYYY').tz(this.store.timeZone).startOf('day').utc(),
                        endDate: moment(date.endDate, 'MM-DD-YYYY').tz(this.store.timeZone).endOf('day').utc()
                    },
                    searchTerm: searchTerm
                };
            }
        )
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/reports/inventory-daily");

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store
            this.getLatestArgs()
            .debounceTime(100)
                .do(() => {
                    this.loadingBarService.interval = 30;
                    this.loadingBarService.start()
                }).subscribe(reportArgs => {

                this.inventoryReportService.inventoryDailyReport(reportArgs)
                    .then(data => {

                        this.loadingBarService.complete();
                        this.chartData = data;
                        this.unsortedChartData = data.slice();
                        this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);
                    });
            });
        });

        Observable.combineLatest(
            CommonAdapter(this.userService, 'id', user => `${user.firstName} ${user.lastName}`),
            CommonAdapter(this.productService, 'id', 'name')
        ).toPromise()
            .then(([EmployeeAdapter, ProductAdapter]) => {

                this.employeeSelect2Options = {
                    ajax: {},
                    placeholder: 'Employee',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.employeeSelect2Options['dataAdapter'] = EmployeeAdapter;
                this.employeeSelect2InitialValue = [];

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
            this.selectedEmployeeId = '';
        }
        this.selectedProductIdSource.next(this.selectedProductId);
        this.selectedEmployeeIdSource.next(this.selectedEmployeeId);
    }

    search(term: string){
        this.selectedSearchTerm = term;
        this.selectedSearchTermSource.next(term);
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }

    onClickExport(report){
        const dateString = '';

        this.getLatestArgs().take(1)
        .subscribe( args => {
            this.inventoryReportService.inventoryDailyReportExport(args)
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
        if(!value){
            this.chartData = this.unsortedChartData.slice();
            this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);
        }else{
            this.chartData.sort(this.dynamicSort(value));
            this.chartDataPage = this.chartData.slice(this.page * 10, this.page * 10 + 10);
        }
    }
}
