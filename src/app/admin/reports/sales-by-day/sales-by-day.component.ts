import {Component, OnInit, OnDestroy } from "@angular/core";
import {Observable,Subscription} from "rxjs";

import {TransactionService} from "../../../services/transaction.service";
import {ITransaction} from "../../../models/interfaces/transaction.interface";


import * as moment from 'moment-timezone';
import * as formatCurrency from 'format-currency';
import {SortBy} from "../../../util/directives/sort-table-header.directive";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

@Component({
    selector: 'app-sales-by-day',
    templateUrl: './sales-by-day.component.html',
})

export class SalesByDayComponent implements OnInit {

    reportDate: Date;
    public chartData: Array<Array<any>>;
    public chartOptions: Object;
    tableData: Array<any>;
    _tableData: Array<any> = [];

    store: IStore;
    storeSubscription: Subscription;

    constructor(private transactionService: TransactionService, private storeService: StoreService){

    }

    ngOnDestroy() {
        this.storeSubscription && this.storeSubscription.unsubscribe()
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
                format: 'currency',
                gridlines: { count: 10},
                textStyle: { color: '#6e858c'}
            }
        };

        this.reportDate = new Date();
        this.reportDate.setHours(0, 0, 0, 0);
        this.tableData = [];

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store
            this.getDataForDate();
        } )
    }

    dateChanged() {
        this.getDataForDate();
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }

    getReportArgs() {

        const timeZone = this.store.timeZone

        // 12/17/2017 should be transferred to the 2017-12-29T07:00:00.000Z in America/Denver timezone (utc-7)
        const startDate = moment(this.reportDate,"MM/DD/YYYY").tz(timeZone).startOf('day').add(1, 'day')
        const endDate = moment(this.reportDate,"MM/DD/YYYY").tz(timeZone).endOf('day').add(1, 'day')

        return { startDate, endDate, timeZone };
    }

    getDataForDate() {
        // Empty the table
        this.tableData = [];
        this._tableData = [];

        this.transactionService.getDailySales( this.getReportArgs() )
        .then((salesData) => {

            if (Object.keys(salesData).length) {
                this.chartData = [['Time', 'Sales', {type: 'string', role: 'tooltip', 'p': {'html': true}}]];
                let dataPoint;
                let total = 0;

                let keys = Object.keys(salesData);

                keys.sort();

                keys.forEach(key => {
                    dataPoint = [];

                    const timeStart = moment(key).tz(this.store.timeZone).format('h:mm a');
                    const timeEnd = moment(key).tz(this.store.timeZone).add(59, 'minutes').format('h:mm a');

                    const amount = this.formatAmount(salesData[key]);

                    dataPoint.push(timeStart);
                    dataPoint.push(salesData[key]);
                    dataPoint.push(`
                    <div style="padding: 15px; font-size: medium">
                    <b>${timeStart} - ${timeEnd}</b> <br />
                    <b>Sales: </b> ${amount}
                    </div>
                    `);

                    this.chartData.push(dataPoint);

                    // Keep total for tableData
                    total += salesData[key];
                    this.tableData.push({hour: `${timeStart} - ${timeEnd}`, amount: amount});
                    this._tableData.push({hour: `${timeStart} - ${timeEnd}`, amount: amount})
                });

                this.tableData.push({hour: 'Total Sales', amount: this.formatAmount(total)});
                this._tableData.push({hour: 'Total Sales', amount: this.formatAmount(total)});

            } else {
                // Empty chartData
                this.chartData = undefined;
            }
        });
    }

    onClickExport(report){
        this.transactionService.downloadReport(Object.assign( this.getReportArgs(), { report } )).then((url) => {
            var iframe = $("<iframe/>").attr({
                src: url,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");
        });
    }

    dynamicSort(property: SortBy) {

        let sortField = property.sortBy;
        let sortOrder = property.direction == 'asc' ? 1 : -1;

        return function(value1, value2) {
            //Need to return 1 or 0
            //Total row is always last
            if(value2.hour == 'Total Sales') return -1;
            if(value1.hour == 'Total Sales') return 1;

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
            this.tableData = [];
            this._tableData.forEach(row => {
                this.tableData.push(row);
            });
        }else{
            this.tableData.sort(this.dynamicSort(value));
        }
    }

}
