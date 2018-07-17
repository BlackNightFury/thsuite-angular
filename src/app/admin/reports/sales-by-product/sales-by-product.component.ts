import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ProductService} from "../../../services/product.service";
import {IProduct} from "../../../models/interfaces/product.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

@Component({
    selector: 'app-sales-by-product',
    templateUrl: './sales-by-product.component.html',
})
export class SalesByProductComponent implements OnInit {

    constructor(private productService: ProductService, private loadingBarService: SlimLoadingBarService) {
    }

    salesData: Observable<IProduct>[];
    _salesData: Array<any> = [];

    searchQuery: BehaviorSubject<string> = new BehaviorSubject('');

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    ngOnInit() {
        this.loadingBarService.interval = 100;

        this.productService.getReportData(this.dateRangeSource, this.searchQuery, this.loadingBarService).subscribe((salesData) => {

            this._salesData = [];
            this.salesData = salesData;
            if(salesData) {
                salesData.forEach(row => {
                    this._salesData.push(row);
                });
            }

            this.loadingBarService.complete();
        })
    }

    updateSearchQuery(searchQuery) {
        this.searchQuery.next(searchQuery);
    }

    onClickExport(report){
        this.dateRangeSource.take(1).subscribe(dateRange => {
            this.productService.downloadReport({report,dateRange}).then((url) => {
                var iframe = $("<iframe/>").attr({
                    src: url,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");
            });
        })

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
