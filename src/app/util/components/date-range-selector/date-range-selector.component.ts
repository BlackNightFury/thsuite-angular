import {Component, Input, OnDestroy, OnInit, ElementRef} from "@angular/core";
import * as moment from 'moment-timezone';
import {didSet} from "../../../lib/decorators/property/didSet";
import {Subscription} from "rxjs/Subscription";
import {DateRange} from "../../../lib/date-range";
import {Subject} from "rxjs/Subject";
import {StoreService} from "../../../services/store.service"
import {IStore} from "../../../models/interfaces/store.interface";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-date-range-selector',
    templateUrl: './date-range-selector.component.html'
})
export class DateRangeSelectorComponent implements OnInit, OnDestroy {
    store: IStore;
    storeSubscription: Subscription;

    preselectedTimeFrame: string;

    timeFrameSelect2Options: Select2Options = {
        placeholder: 'Select a Time Frame',
        data: [
            {
                id: 'today',
                text: 'Today'
            },
            {
                id: 'yesterday',
                text: 'Yesterday'

            },
            {
                id: 'thisWeek',
                text: 'This Week'
            },
            {
                id: 'thisMonth',
                text: 'This Month'
            },
            {
                id: 'lastMonth',
                text: 'Last Month'
            },
            {
                id: 'thisQuarter',
                text: 'This Quarter'
            },
            {
                id: 'custom',
                text: 'Specific Date Range'
            }
        ]
    };

    selectedStartDate: Date;

    selectedEndDate: Date;

    @Input() selectedDateRangeSubject: Subject<DateRange> = new Subject<DateRange>();

    selectedTimeFrame: string;

    selectedDateRange: DateRange = {
        startDate: undefined,
        endDate: undefined
    };

    setSelectedDateRange(newValue: DateRange) {
        this.selectedDateRange = newValue;
        this.selectedDateRangeSubject.next(newValue);
    }

    constructor(private storeService: StoreService, elm: ElementRef) {
        this.preselectedTimeFrame = elm.nativeElement.getAttribute('preselectedTimeFrame');
    }

    ngOnInit() {
        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;

            this.selectedTimeFrame = this.preselectedTimeFrame || environment.defaultTimeFrame || 'thisWeek';

            this.update();
        });
    }

    ngOnDestroy() {
        if (this.storeSubscription) {
            this.storeSubscription.unsubscribe();
        }
    }

    getDateRange(timeZone: string, interval: string, start = moment(), end = moment()) {
        return {startDate: start.tz(timeZone).startOf(interval).utc(), endDate: end.tz(timeZone).endOf(interval).utc()};
    }

    onSelectedTimeFrameChange(newValue) {
        this.selectedTimeFrame = newValue;

        this.update();
    }

    update(){

        switch (this.selectedTimeFrame) {
            case 'today':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'day'));
                break;
            case 'yesterday':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'day', moment().subtract(1, 'days'), moment().subtract(1, 'days')));
                break;
            case 'thisWeek':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'week'));
                break;
            case 'thisMonth':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'month'));
                break;
            case 'lastMonth':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(
                    this.store.timeZone,
                    'month',
                    moment().subtract(1, 'months').date(1),
                    moment().subtract(1, 'months').date(1),
                ));
                break;
            case 'thisQuarter':
                this.selectedStartDate = undefined;
                this.selectedEndDate = undefined;
                this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'quarter'));
                break;
            case 'custom':
                if (this.selectedStartDate && this.selectedEndDate) {
                    this.setSelectedDateRange(this.getDateRange(this.store.timeZone, 'day', moment(this.selectedStartDate), moment(this.selectedEndDate)));
                }
                break;
        }
    }

    onSelectedStartDate(newValue) {

        this.selectedStartDate = newValue;

        if (newValue) {
            this.selectedTimeFrame = 'custom';
        }

        this.update();
    }

    onSelectedEndDate(newValue) {

        this.selectedEndDate = newValue;

        if (newValue) {
            this.selectedTimeFrame = 'custom';
        }

        this.update();
    }
}
