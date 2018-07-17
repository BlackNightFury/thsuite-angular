import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";

import {ProductTypeService, IProductTypeFilters} from "../../../services/product-type.service";
import {IProductType} from "../../../models/interfaces/product-type.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscription} from "rxjs/Subscription";
import {UserService} from "../../../services/user.service";
import {IUser} from "../../../models/interfaces/user.interface";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetEmployeeId(newValue){
    this.employeeUserIdSource.next(newValue);
}

export function didSetProductTypeId(newValue){
    this.selectedProductTypeIdSource.next(newValue);
}

@Component({
    selector: 'app-sales-by-product-type',
    templateUrl: './sales-by-product-type.component.html',
})
export class SalesByProductTypeComponent implements OnInit {

    productSubscription: Subscription;

    @didSet(didSetEmployeeId) selectedEmployeeId: string;
    @didSet(didSetProductTypeId) selectedProductTypeId: string;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    employeeUserIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    employeeSelect2Options: Select2Options;

    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    productTypeSelect2Options: Select2Options;

    salesData: Observable<IProductType>[];
    _salesData: Array<any> = [];

    combineLatest() {
        return Observable.combineLatest(
            this.dateRangeSource,
            this.employeeUserIdSource,
            this.selectedProductTypeIdSource,
            (dateRange, userId, productTypeId) => {
                return {
                    dateRange: dateRange,
                    filters:{
                        userId: userId,
                        productTypeId: productTypeId
                    }
                }
            }
        )
    }

    constructor(
        private productTypeService: ProductTypeService,
        private userService: UserService,
        private loadingBarService: SlimLoadingBarService,
        private previousRouteService: PreviousRouteService
    ) {
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/reports/product-type");

        this.productSubscription = this.combineLatest()
            .do(() => {
                    this.loadingBarService.interval = 100;
                    this.loadingBarService.start()
                })
                .switchMap(searchTerms => this.productTypeService.getReportData(searchTerms.dateRange, searchTerms.filters))
                .subscribe(salesData => {
                    this._salesData = [];
                    this.salesData = salesData;
                    if(salesData) {
                        salesData.forEach(row => {
                            this._salesData.push(row);
                        })
                    }

                    this.loadingBarService.complete();
                });

        Observable.combineLatest(
            CommonAdapter(this.userService, 'id', user => `${user.firstName} ${user.lastName}`, {}),
            CommonAdapter(this.productTypeService, 'id', 'name'),
        ).toPromise()
            .then(([UserAdapter, ProductTypeAdapter]) => {

                this.employeeSelect2Options = {
                    placeholder: "Employee",
                    allowClear: true,
                    ajax: { },
                    dropdownCssClass: 'compact'
                };
                this.employeeSelect2Options['dataAdapter'] = UserAdapter;

                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
            });

        this.prepareSearch(navigationFromChild);
    }

    ngOnDestroy() {
        this.productSubscription && this.productSubscription.unsubscribe()
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedProductTypeId = '';
            this.selectedEmployeeId = '';
        }
        this.selectedProductTypeIdSource.next(this.selectedProductTypeId);
        this.employeeUserIdSource.next(this.selectedEmployeeId);
    }

    onClickExport(report){

        const sub = this.combineLatest()
            .do(() => {
                    this.loadingBarService.interval = 50;
                    this.loadingBarService.start()
                })
                .switchMap(searchTerms => {
                    return this.productTypeService.downloadReport({ report: report, dateRange: searchTerms.dateRange, filters: searchTerms.filters});
                })
                .subscribe(url => {
                    var iframe = $("<iframe/>").attr({
                        src: url,
                        style: "visibility:hidden;display:none"
                    }).appendTo(".content");

                    this.loadingBarService.complete();
                    sub.unsubscribe();
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
            if (sortField == 'average'){
                //Need to compute separately
                sort1 = (value1['sum']/value1['count']);
                sort2 = (value2['sum']/value2['count']);
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
        this._sortBy = value;
        if(!value){
            this.salesData = [];
            this._salesData.forEach(row => {
                this.salesData.push(row);
            });
        }else{
            this.salesData.sort(this.dynamicSort(value));
        }
    }

}
