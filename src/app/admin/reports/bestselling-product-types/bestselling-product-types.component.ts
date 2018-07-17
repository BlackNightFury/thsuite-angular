import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";

import {ProductTypeService} from "../../../services/product-type.service";
import {IProductType} from "../../../models/interfaces/product-type.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Component({
    selector: 'app-bestselling-product-types',
    templateUrl: './bestselling-product-types.component.html',
})
export class BestsellingProductTypesComponent implements OnInit {

    constructor(private productTypeService: ProductTypeService) {
    }

    salesData: Observable<IProductType>[];
    _salesData: Array<any> = [];


    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);


    ngOnInit() {
        this.productTypeService.getBestSellingData(this.dateRangeSource).subscribe((salesData) => {
            this._salesData = [];
            this.salesData = salesData;
            salesData.forEach(row => {
                this._salesData.push(row);
            })
        });
    }
    onClickExport(report){
        this.dateRangeSource.take(1).subscribe(dateRange => {
            this.productTypeService.downloadReport({report,dateRange}).then((url) => {
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
