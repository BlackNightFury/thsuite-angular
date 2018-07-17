import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";

import {TransactionService} from "../../../services/transaction.service";
import {ITransaction} from "../../../models/interfaces/transaction.interface";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";


import * as moment from 'moment-timezone';
import * as formatCurrency from 'format-currency';
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

@Component({
    selector: 'app-sales-peak',
    templateUrl: './sales-peak.component.html',
    styleUrls: [ './sales-peak.component.css' ]
})
export class SalesPeakComponent implements OnInit, OnDestroy{

    public chartData: Array<Array<any>>;
    public chartOptions: any;

    // tableData: Array<any>;
    dowTableData: Array<any>;
    todTableData: Array<any>;

    selectedPrimaryStartDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    selectedPrimaryEndDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    selectedSecondaryStartDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    selectedSecondaryEndDateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    toggleModeSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    secondaryDateRangeToggleSource: BehaviorSubject<boolean> = new BehaviorSubject(undefined);

    store: IStore;
    storeSubscription: Subscription;

    todDayViewSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    toggleModeOptions: Array<any> = [
        {
            label: 'Day of Week',
            value: 'dow'
        },
        {
            label: 'Time of Day',
            value: 'tod'
        }
    ];

    results: Observable<any>;

    protected loadingBarService: SlimLoadingBarService;

    daysOfTheWeek: string[] = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    combineLatestArgs() {
        return Observable.combineLatest(
            this.toggleModeSource,
            this.secondaryDateRangeToggleSource,
            this.selectedPrimaryStartDateSource,
            this.selectedPrimaryEndDateSource,
            this.selectedSecondaryStartDateSource,
            this.selectedSecondaryEndDateSource,
            this.todDayViewSource,
            (mode, secondary, primaryStart, primaryEnd, secondaryStart, secondaryEnd, dayView) => {
                return {
                    mode: mode,
                    selected: {
                        primary: true,
                        secondary: secondary
                    },
                    primaryStart:  moment(primaryStart, "MM/DD/YYYY").tz(this.store.timeZone).utc(),
                    primaryEnd: moment(primaryEnd, "MM/DD/YYYY" ).tz(this.store.timeZone).utc(),
                    secondaryStart: moment(secondaryStart, "MM/DD/YYYY" ).tz(this.store.timeZone).utc(),
                    secondaryEnd: moment(secondaryEnd, "MM/DD/YYYY" ).tz(this.store.timeZone).utc(),
                    dayView: dayView
                };
            }
        )
    }

    constructor(private transactionService: TransactionService, loadingBarService: SlimLoadingBarService, private storeService: StoreService){
        this.loadingBarService = loadingBarService;
    }

    ngOnDestroy() {
        this.storeSubscription && this.storeSubscription.unsubscribe()
    }

    ngOnInit(){

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
                0: {color: '#28bd8b'},
                1: {color: '#169fd3'}
            },
            tooltip: {
                textStyle: { color: '#6e858c'},
                isHtml: true
            },
            vAxis: {
                format: 'currency',
                textStyle: { color: '#6e858c'}
            }
        };

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store
            this.selectedPrimaryStartDate = moment().tz(store.timeZone).startOf('week').utc().format('MM/DD/YYYY');
            this.selectedPrimaryEndDate = moment().tz(store.timeZone).utc().format('MM/DD/YYYY');

            this.combineLatestArgs()
            .debounceTime(100)
                .do(() => {
                    this.loadingBarService.interval = 60;
                    this.loadingBarService.start()
                })
                .subscribe((terms) => {

                this.results = this.transactionService.getPeakSales(Object.assign({timeZone:this.store.timeZone},terms));
                this.results.subscribe(data => {
                    if(Object.keys(data).length){
                        this.dowTableData = [];
                        this.todTableData = [];

                        let chartHeader = [];
                        chartHeader.push('Primary');
                        //Push tooltip column
                        chartHeader.push({type: 'string', role: 'tooltip', 'p': {'html': true}});

                        if(this.secondaryDateRangeToggle){
                            chartHeader.push("Secondary");
                            //Push tooltip column
                            chartHeader.push({type: 'string', role: 'tooltip', 'p': {'html': true}});
                        }

                        if(this.modeOptions == 'dow'){

                            //If todDayView is set, need to process as TOD even though mode is dow
                            if(this.todDayView != 'all'){
                                chartHeader.unshift("Time of Day");

                                this.chartData = [chartHeader];

                                this.processToDData(data);
                            }else{

                                chartHeader.unshift("Day of Week");

                                this.chartData = [chartHeader];

                                this.processDoWData(data);
                            }




                        } else {

                            chartHeader.unshift("Time of Day");

                            this.chartData = [chartHeader];

                            this.processToDData(data);
                        }

                    } else {
                        this.chartData = undefined;
                        this.dowTableData = undefined;
                        this.todTableData = undefined;
                    }

                    this.loadingBarService.complete();

                });
            });
        });

        this.modeOptions = 'dow';
        this.secondaryDateRangeToggle = false;

    }

    onClickExport(report) {
        this.combineLatestArgs().take(1).subscribe(args => {
            this.transactionService.downloadReport(Object.assign({report,timeZone: this.store.timeZone},args))
            .then(url => {
                var iframe = $("<iframe/>").attr({
                    src: url,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");
            })
        })
    }
                
    onRowClick(event, day: 'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'){
        //Set todDayView to this day, will trigger an update
        // this.modeOptions = 'tod';
        this.todDayView = day;

    }

    backToDoW(event){
        this.modeOptions = 'dow';
        this.todDayView = 'all';
    }

    formatHour(hour: number): string{
        let result;

        if(hour == 12){
            result = "12pm";
        } else if(hour == 0 || hour == 24){
            result = "12am";
        } else if(hour > 12){
            result = (hour - 12) + 'pm';
        }else{
            result = hour + 'am';
        }

        return result;
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }


    processDoWData(data: any[]){
        this.daysOfTheWeek.forEach(day => {

            let dataPoint = [];
            dataPoint.push(day);

            let dayData = data['primary'][day];
            dataPoint.push(dayData.sum);
            //Push tooltip here
            dataPoint.push(`
                <div style="padding: 15px; font-size: medium">
                <b>${day}</b> <br />
                <b>Sales: </b> ${this.formatAmount(dayData.sum)}
                </div>
            `);

            if(this.secondaryDateRangeToggle){
                let dayData = data['secondary'][day];
                dataPoint.push(dayData.sum);
                //Push tooltip here
                dataPoint.push(`
                    <div style="padding: 15px; font-size: medium">
                    <b>${day}</b> <br />
                    <b>Sales: </b> ${this.formatAmount(dayData.sum)}
                    </div>
                `);
            }



            this.chartData.push(dataPoint);

            //Table needs top hour, and sum from primary

            let busiest;

            if(dayData.maxHr == -1){
                //Day had no sales
                busiest = ''
            }else{
                let topHour = dayData.maxHr;
                let topHourEnd = topHour + 1;

                let topHourString = this.formatHour(topHour);
                let topHourEndString = this.formatHour(topHourEnd);
                busiest = topHourString + ' - ' + topHourEndString
            }

            this.dowTableData.push({
                day: day,
                busiest: busiest,
                product: dayData.topProd,
                revenue: dayData.sum
            });

        });

    }

    processToDData(data: any[]){

        for(let i = 0; i < 24; i++) {

            let dataPoint = [];
            dataPoint.push(this.formatHour(i));

            let hourData = data['primary'][i];
            dataPoint.push(hourData.sum);
            let hour = this.formatHour(i) + ' - ' + this.formatHour(i+1);
            dataPoint.push(`
                <div style="padding: 15px; font-size: medium">
                <b>${hour}</b> <br />
                <b>Sales: </b> ${this.formatAmount(hourData.sum)}
                </div>
            `);

            if(this.secondaryDateRangeToggle){
                let hourData = data['secondary'][i];
                dataPoint.push(hourData.sum);
                let hour = this.formatHour(i) + ' - ' + this.formatHour(i+1);
                dataPoint.push(`
                    <div style="padding: 15px; font-size: medium">
                    <b>${hour}</b> <br />
                    <b>Sales: </b> ${this.formatAmount(hourData.sum)}
                    </div>
                `);
            }

            this.chartData.push(dataPoint);

            //Table needs top hour, and sum from primary

            let busiest = hourData.maxDay;

            this.todTableData.push({
                hour: hour,
                busiest: busiest,
                product: hourData.topProd,
                revenue: hourData.sum
            });

        }
    }

    private _todDayView: 'all'|'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday' = 'all';
    set todDayView(value: 'all'|'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'){
        this._todDayView = value;
        //If this value is anything other than all, emit modeOptions as tod as well
        if(value != 'all'){
            this.toggleModeSource.next('tod');
        }
        this.todDayViewSource.next(value);
    }

    get todDayView(){
        return this._todDayView;
    }

    private _modeOptions: 'dow'|'tod' = 'dow';

    set modeOptions(value: 'dow'|'tod') {
        //If this toggle is ever clicked, todDayView resets to all
        if(this.todDayView != 'all'){
            this.todDayView = 'all';
        }

        this._modeOptions = value;
        if(value == 'dow'){
            this.todTableData = undefined;
        }else{
            this.dowTableData = undefined;
        }
        this.toggleModeSource.next(value);
    }

    get modeOptions() {
        return this._modeOptions;
    }


    private _secondaryDateRangeToggle: boolean = false;
    set secondaryDateRangeToggle(value: boolean) {
        this._secondaryDateRangeToggle = value;
        this.secondaryDateRangeToggleSource.next(value);
    }

    get secondaryDateRangeToggle(){
        return this._secondaryDateRangeToggle;
    }


    private _selectedPrimaryStartDate: string;
    get selectedPrimaryStartDate() {
        return this._selectedPrimaryStartDate;
    }
    set selectedPrimaryStartDate(newValue: string) {
        this._selectedPrimaryStartDate = newValue;
        this.selectedPrimaryStartDateSource.next(newValue);
    }

    private _selectedPrimaryEndDate: string;
    get selectedPrimaryEndDate() {
        return this._selectedPrimaryEndDate;
    }
    set selectedPrimaryEndDate(newValue: string) {
        this._selectedPrimaryEndDate = newValue;
        this.selectedPrimaryEndDateSource.next(newValue);
    }

    private _selectedSecondaryStartDate: string;
    get selectedSecondaryStartDate() {
        return this._selectedSecondaryStartDate;
    }
    set selectedSecondaryStartDate(newValue: string) {
        this._selectedSecondaryStartDate = newValue;
        this.selectedSecondaryStartDateSource.next(newValue);
    }

    private _selectedSecondaryEndDate: string;
    get selectedSecondaryEndDate() {
        return this._selectedSecondaryEndDate;
    }
    set selectedSecondaryEndDate(newValue: string) {
        this._selectedSecondaryEndDate = newValue;
        this.selectedSecondaryEndDateSource.next(newValue);
    }


}
