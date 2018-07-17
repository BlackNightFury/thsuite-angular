import {Component, OnInit} from "@angular/core";
import {Select2OptionData} from "ng2-select2";
import {DatePeriodService} from "../../../date-period.service";
import {Observable} from "rxjs";
import {TransactionService} from "../../../services/transaction.service";
import {didSet} from "../../../lib/decorators/property/didSet";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment-timezone';
import * as formatCurrency from 'format-currency';
import {ReplaySubject} from "rxjs/ReplaySubject";
import {StoreService} from "../../../services/store.service";
import {Subscription} from "rxjs/Subscription";
import {start} from "repl";


export function didSetSelectedType(newValue) {
    this.setChartData(newValue);
}


export function didSetGranularity(newValue){
    this.toggleGranularitySource.next(newValue);
}


@Component({
    selector: 'app-sales-over-time',
    templateUrl: './sales-over-time.component.html'
})
export class SalesOverTimeComponent implements OnInit {

    salesData: any[];
    chartData: Array<Array<any>>;
    chartOptions: any;

    // numberOfDays: number;

    @didSet(didSetSelectedType) selectedType: string = "dollars";
    @didSet(didSetGranularity) selectedGranularity: 'hour' | 'day' | 'week';

    typeSelect2Options: Select2Options = {
        placeholder: 'View Type',
        data: [
            {
                id: 'dollars',
                text: 'Dollars'
            },
            {
                id: 'transactions',
                text: 'Transactions'
            }
        ]
    };

    toggleGranularityOptions: Array<Object> = [
        {
            label: 'Hours',
            value: 'hour'
        },
        {
            label: 'Days',
            value: 'day'
        },
        {
            label: 'Weeks',
            value: 'week'
        }
    ];

    toggleGranularityOneDay: Array<Object> = [
        {
            label: 'Hours',
            value: 'hour'
        }
    ];

    toggleGranularityShortTimeFrame: Array<Object> = [
        {
            label: 'Hours',
            value: 'hour'
        },
        {
            label: 'Days',
            value: 'day'
        }
    ];

    toggleGranularityLongTimeFrame: Array<Object> = [
        {
            label: 'Days',
            value: 'day'
        },
        {
            label: 'Weeks',
            value: 'week'
        }
    ];



    toggleGranularitySource: BehaviorSubject<string> = new BehaviorSubject('day');

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);
    selectedRange: DateRange;

    storeSubscription: Subscription;
    storeTimeZone: string;

    numberOfDays: number;

    constructor(private transactionService: TransactionService,
                private storeService: StoreService) {
    }

    ngOnInit() {

        this.dateRangeSource.subscribe(dateRange => {
            this.selectedRange = dateRange;

            // changing granularity/toggle based on the change in dateRange.
            this.numberOfDays = this.selectedRange.endDate.diff(this.selectedRange.startDate, 'days') + 1;
            if (this.numberOfDays <= 1) this.selectedGranularity = 'hour';
            else if (this.numberOfDays > 1 && this.numberOfDays <= 31) this.selectedGranularity = 'day';
            else if (this.numberOfDays > 31) this.selectedGranularity = 'week';
        });

        this.selectedGranularity = 'day'; // On init, dateRange is 'This Week' so 'hour' granularity makes most sense
        this.toggleGranularitySource.next(this.selectedGranularity);

        this.chartOptions = {
            animation : {
                startup: true,
                duration: 500,
                easing: 'out'
            },
            chartArea : {height: '80%', width: '80%'},
            hAxis: {
                textStyle: { color: '#6e858c'},
            },
            vAxis: {
                format: 'currency',
                gridlines: { count: 10},
                textStyle: { color: '#6e858c'},
            },
            height: 400,
            legend: {
                position: "none"
            },
            series: {
                0: {color: '#18A9E2'}
            },
            tooltip: {
                textStyle: { color: '#6e858c'},
                isHtml: true
            },
        };

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.storeTimeZone = store.timeZone;
            console.log("Time Zone: " + this.storeTimeZone);
        });

        this.transactionService.getSalesOverTime(this.dateRangeSource, this.toggleGranularitySource)
            .subscribe(data => {
                this.salesData = data;
                this.setChartData(this.selectedType);
            });
    }

    ngOnDestroy() {
        this.storeSubscription && this.storeSubscription.unsubscribe()
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }

    setChartData(type: string) {
        this.chartData = undefined;

        let chartData = [];

        let header = [{role: 'domain', type: 'datetime'}, {type:'number', role:'data'}, {type: 'string', role: 'tooltip', 'p': {'html': true}}];
        chartData.push(header);

        if(this.salesData){

            let keys = Object.keys(this.salesData);

            keys.sort();

            keys.forEach(date => {
                let dataPoint = [];

                let label;
                let formattedLabel;
                let amount;
                let formattedAmount;
                let tooltip;

                let dateKey = moment.utc(date).local().toDate();

                let localTimeUtcOffset = moment.utc(date).local().utcOffset();
                let desiredTimeUtcOffset = moment.utc(date).tz(this.storeTimeZone).utcOffset();
                let offset = ( desiredTimeUtcOffset - localTimeUtcOffset ) * 60000;

                dateKey.setTime(dateKey.getTime() + offset);
                // console.log("Offset" + offset);
                // console.log("Date Time:" + dateKey.getTime());
                // console.log("New Date Time: " + dateKey.getTime())

                let hours  = dateKey.getHours();
                var timeStart;
                var timeEnd;

                const formattedStartDay = (dateKey.getMonth()+1).toString() + "/" + dateKey.getDate().toString();

                if(this.selectedGranularity == 'hour'){
                    label = dateKey;

                    if (hours == 0) {
                        timeStart = "12";
                        timeEnd = "12:59 AM";
                    } else if (hours == 12){
                        timeStart = "12";
                        timeEnd = "12:59 PM";
                    } else if ( hours > 11){
                        timeStart = (hours-12).toString();
                        timeEnd = (hours-12).toString() + ":59 PM";
                    } else{
                        timeStart = hours.toString();
                        timeEnd = hours.toString() + ":59 AM";
                    }

                    formattedLabel = formattedStartDay + ': ' + timeStart + '-' + timeEnd;
                } else if(this.selectedGranularity == 'day') {
                    dateKey.setTime(dateKey.getTime() - 43200000);
                    label = dateKey;
                    // shift by 12 hours keeps you on same day as formattedStartDay. okay to use.
                    formattedLabel = formattedStartDay;
                } else if(this.selectedGranularity == 'week'){
                    dateKey.setTime(dateKey.getTime() - 302400000);
                    label = dateKey;

                    // shift by 3.5 days so cannot use formattedStartDay. Also need to account for overflow.
                    const formattedStart = (dateKey.getMonth()+1).toString() + "/" + dateKey.getDate().toString();
                    formattedLabel = "Week of " + formattedStart;
                }

                if(type == 'dollars') {
                    this.chartOptions.vAxis = {
                        format: 'currency',
                        gridlines: {count: 10},
                        textStyle: {color: '#6e858c'},
                    };

                    amount = this.salesData[date].dollars;
                    formattedAmount = this.formatAmount(amount);
                    tooltip = `
                            <div style="padding: 15px; font-size: medium">
                            <b>${formattedLabel}</b> <br />
                            <b>Total Sales: </b> ${formattedAmount}
                            </div>
                    `;
                }
                else if(type == 'transactions') {
                    this.chartOptions.vAxis = {
                        gridlines: {count: 10},
                        textStyle: {color: '#6e858c'},
                    };

                    amount = this.salesData[date].receiptCount;
                    formattedAmount = amount;
                    tooltip = `
                            <div style="padding: 15px; font-size: medium">
                            <b>${formattedLabel}</b> <br />
                            <b>Total Transactions: </b> ${formattedAmount}
                            </div>
                    
                    `;
                }

                dataPoint.push(label);
                dataPoint.push(amount);
                dataPoint.push(tooltip);

                chartData.push(dataPoint);
            });

            this.chartData = chartData;
        }


    }

}
