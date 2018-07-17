import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";

import {DiscountService} from "../../../services/discount.service";
import {IDiscount} from "../../../models/interfaces/discount.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";


@Component({
    selector: 'app-discounts-by-type',
    templateUrl: './discounts-by-type.component.html',
})
export class DiscountsByTypeComponent implements OnInit{

    discountData: Observable<IDiscount>[];
    //Unsorted data -- leave alone when sorting
    _discountData: Array<any> = [];

    constructor (private discountService: DiscountService){
    }


    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);


    ngOnInit() {
        this.discountService.getReportData('type', this.dateRangeSource).subscribe((discountData) => {

            // this.dateRangeSource
            this.discountData = discountData;
            if(!discountData) return

            discountData.forEach(row => {
                this._discountData.push(row);
            })
        });
    }

    onClickExport(report){
        this.dateRangeSource.take(1).subscribe(dateRange => {
            this.discountService.downloadReport({report,dateRange}).then((url) => {
                var iframe = $("<iframe/>").attr({
                    src: url,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");
            });
        } )
    }

    dynamicSort(property: SortBy) {

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
            if (sortField == 'profit'){
                sort1 = value1.totalPrice - value1.amount
                sort2 = value2.totalPrice - value2.amount
            } else if (sortField == 'average'){
                //Need to compute separately
                sort1 = (value1['amount']/value1['count']);
                sort2 = (value2['amount']/value2['count']);
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
            this.discountData = [];
            this._discountData.forEach(row => {
                this.discountData.push(row);
            });
        }else{
            this.discountData.sort(this.dynamicSort(value));
        }
    }
}
