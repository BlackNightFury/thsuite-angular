import {Component, EventEmitter, forwardRef, Input, OnInit, OnDestroy, Output} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ObjectWithToggle} from "../../../lib/object-with-toggle";
import {DateRange} from "../../../lib/date-range";
import {didSet} from "../../../lib/decorators/property/didSet";
import * as moment from "moment-timezone";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";

import {IReceipt} from "../../../models/interfaces/receipt.interface";
import {ReceiptService} from "../../../services/receipt.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {TaxService} from "../../../services/tax.service";
import {UserService} from "../../../services/user.service";
import {ITax} from "../../../models/interfaces/tax.interface";
import {TimeClockService} from "../../../services/time-clock.service";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import {PreviousRouteService} from "../../../services/previous-route.service";


export function didSetSelectedStartDate(newValue) {
    if(newValue) {
        this.selectedTimeFrame = 'custom';
    }
}

export function didSetSelectedEndDate(newValue) {
    if(newValue) {
        this.selectedTimeFrame = 'custom';
    }
}

export function didSetSelectedDateRangeSubject(newValue) {
    newValue.next(this.selectedDateRange);
}

export function didSetSelectedTimeFrame(newValue) {
    if( newValue === 'custom' ) {
        if(this.selectedStartDate && this.selectedEndDate) {
            this.setSelectedDateRange({
                startDate: moment.utc(this.selectedStartDate).startOf('day'),
                endDate: moment.utc(this.selectedEndDate).endOf('day')
            });
        }
        return;
    }

    this.selectedStartDate = undefined;
    this.selectedEndDate = undefined;
    this.setSelectedDateRange({
        startDate: this.fourRecentPayPeriods[newValue].start,
        endDate: this.fourRecentPayPeriods[newValue].end
    });
}

export function didSetReportType(newValue){
    this.toggleReportTypeSource.next(newValue);
}

@Component({
    selector: 'app-time-clocks-index',
    templateUrl: './time-clocks-index.component.html',
    styleUrls: [ './time-clocks-index.component.css' ]
})
export class TimeClocksIndexComponent implements OnInit{

    public rows: any[] = [ ];

    @didSet(didSetReportType) reportType: 'aggregate'| 'detail';

    toggleReportTypeOptions: Array<Object> = [
        {
            label: 'Aggregate',
            value: 'aggregate'
        },
        {
            label: 'Detail',
            value: 'detail'
        }
    ];

    toggleReportTypeSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    @didSet(didSetSelectedStartDate) selectedStartDate: Date;
    @didSet(didSetSelectedEndDate) selectedEndDate: Date;
    @didSet(didSetSelectedDateRangeSubject) selectedDateRangeSubject: Subject<DateRange> = new Subject<DateRange>();
    @didSet(didSetSelectedTimeFrame) selectedTimeFrame: string;

    displayEmployee: any = { }

    selectedDateRange: DateRange;

    setSelectedDateRange(newValue: DateRange) {
        this.selectedDateRange = newValue;
        this.selectedDateRangeSubject.next(newValue);
    }

    timeFrameSelect2Options: Select2Options = {
        placeholder: 'Select a Time Frame',
        data: [ ]
    };

    employeeSelect2Options: Select2Options;

    fourRecentPayPeriods: any[] = [ ]

    private currentReportArgsEmittedSubscription: Subscription;

    selectedEmployeeIdsSource: Subject<string[]> = new Subject();
    private _selectedEmployeeIds: string[] = [];
    set selectedEmployeeIds(value: string[]) {
        this._selectedEmployeeIds = value;
        this.selectedEmployeeIdsSource.next(value);
    }
    get selectedEmployeeIds() {
        return this._selectedEmployeeIds;
    }

    public store: IStore;
    storeSubscription: Subscription;
    type: string = 'aggregate';

    constructor(
        private timeClockService: TimeClockService,
        private loadingBarService: SlimLoadingBarService,
        private userService: UserService,
        private storeService: StoreService,
        private previousRouteService: PreviousRouteService
    ) {

        let tempDate = moment()

        while( this.fourRecentPayPeriods.length < 4 ) {
            let start, end
            if( tempDate.get('date') >= 16 ) {
                start = tempDate.clone().set('date',16)
                end = tempDate.clone().endOf('month')
                tempDate.set('date',1)
            } else {
                start = tempDate.clone().set('date',1),
                end = tempDate.clone().set('date',15)
                tempDate.set('month',(tempDate.get('month') - 1))
                tempDate.endOf('month')
            }
           this.timeFrameSelect2Options.data.push( {
                id: this.fourRecentPayPeriods.length,
                text: `${start.format("MMM Do")} - ${end.format("MMM Do")}`
            } )
           this.fourRecentPayPeriods.push( { start, end } )
        }

        this.timeFrameSelect2Options.data.push( {
            id: 'custom',
            text: 'Specific Date Range'
        } )

    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/reports/time-clocks-index");

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;

            this.currentReportArgsEmittedSubscription =
                Observable.combineLatest(
                    this.selectedDateRangeSubject,

                    ( dateRange ) => {
                        return {
                            dateRange: { startDate: moment(dateRange.startDate).tz(store.timeZone).utc(), endDate: moment(dateRange.endDate).tz(store.timeZone).utc() },

                            timeZone: store.timeZone}
                        }

            ).do(() => {
                this.loadingBarService.interval = 100;
                this.loadingBarService.start()
            })
            .subscribe(args => {
                this.timeClockService.overallReport(args)
                    .then(rows => {
                        this.displayEmployee = { };
                        this.selectedEmployeeIds.forEach(id => this.displayEmployee[id] = true );
                        this.employeeSelect2Options = undefined
                        this.rows = rows;
                        this.loadingBarService.complete();

                        CommonAdapter(this.userService, 'id', user => `${user.firstName} ${user.lastName}`, {})
                        .then(UserAdapter => {
                            let employeeSelect2Options = {
                                multiple: true,
                                placeholder: "Search Employees",ajax: { }
                            }

                            employeeSelect2Options['dataAdapter'] = UserAdapter
                            this.employeeSelect2Options = employeeSelect2Options

                            this.updateSingles()

                        })
                        .catch(e => console.log(e.stack || e ))
                    })
            });

            this.selectedTimeFrame = '0'
        });

        this.selectedEmployeeIdsSource.subscribe( ids => {
            this.displayEmployee = { }
            ids.forEach( id => this.displayEmployee[id] = true )
        });

        this.toggleReportTypeSource.subscribe( type => {
            this.type = type
            this.updateSingles()
        });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.reportType = 'aggregate';
        }
        this.toggleReportTypeSource.next(this.reportType);
    }

    ngOnDestroy(){
        this.storeSubscription && this.storeSubscription.unsubscribe()
        this.currentReportArgsEmittedSubscription && this.currentReportArgsEmittedSubscription.unsubscribe();
    }

    updateSingles() {
        Array.from(document.querySelectorAll('.employee-single-clock-in-out'))
        .forEach( el => el.classList.toggle('toggle-hide', this.type === 'aggregate') )
    }

    onClickExport() {
        this.downloadReport();
    }

    downloadReport() {
        this.timeClockService.overallReport( { dateRange: this.selectedDateRange, reportType: this.reportType, export: true, timeZone: this.store.timeZone } )
        .then( url => {
             var iframe = $("<iframe/>").attr({
                 src: url.Location,
                 style: "visibility:hidden;display:none"
             }).appendTo(".content");
        })
        .catch( e => console.log(e.stack || e ) )
    }
}
