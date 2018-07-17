import {Component, OnInit} from "@angular/core";

import {TransactionService} from "../../../services/transaction.service";
import {ITransaction} from "../../../models/interfaces/transaction.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Component({
    selector: 'app-sales-by-employee',
    templateUrl: './sales-by-employee.component.html',
})
export class SalesByEmployeeComponent implements OnInit {

    salesData: Array<any>;
    //Unsorted data -- leave alone when sorting
    _salesData: Array<any> = [];

    constructor(private transactionService: TransactionService) {
    }


    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    ngOnInit() {
        this.transactionService.getEmployeeSalesData(this.dateRangeSource).subscribe((salesData) => {
            this._salesData = [];
            this.salesData = salesData;
            if(salesData) {
                salesData.forEach(row => {
                    this._salesData.push(row);
                });
            }

        });
    }
    onClickExport(report){
        this.dateRangeSource.take(1).subscribe(dateRange => {
            this.transactionService.downloadReport({report,dateRange}).then((url) => {
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
            if(value2.first == 'Total') return -1;
            if(value1.first == 'Total') return 1;

            let result;
            let sort1;
            let sort2;
            if (sortField == 'average'){
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
            this.salesData = [];
            this._salesData.forEach(row => {
                this.salesData.push(row);
            });
        }else{
            this.salesData.sort(this.dynamicSort(value));
        }
    }

}
