import {Component, Injector, OnInit} from "@angular/core";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {TimeClockService} from "../../../../services/time-clock.service";
import {ITimeClock} from "../../../../models/interfaces/time-clock.interface";
import {Subscription} from "rxjs/Subscription";

import * as moment from 'moment-timezone';
import {Observable} from "rxjs/Observable";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {UserService} from "../../../../services/user.service";

import {StoreService} from "../../../../services/store.service";
import {IStore} from "../../../../models/interfaces/store.interface";

@Component({
    selector: 'app-add-edit-view-time-clock',
    templateUrl: './add-edit-view-time-clock.component.html',
    styleUrls: ['./add-edit-view-time-clock.component.css']
})
export class AddEditViewTimeClockComponent extends AddEditViewObjectComponent<ITimeClock> implements OnInit{

    errors: string[] = [];
    errorFlags: {
        timeClockIn: boolean;
        timeClockOut: boolean;
        user: boolean;
    } = {
        timeClockIn: false,
        timeClockOut: false,
        user: false
    };

    userSelect2Options : Select2Options;

    removalNeedsPin: boolean = false;

    managerPin: string;
    pinCorrect: boolean = true;

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(injector: Injector, private timeClockService: TimeClockService, private storeService: StoreService){
        super(injector, timeClockService);
    }

    ngOnInit(){
        super.ngOnInit();

        this.objectObservable.take(1).subscribe(() => {

            this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
                this.store = store;

                if(this.object.clockIn) {
                    this.object.clockInAtStoreTimezone = moment(moment.tz(this.object.clockIn, this.store.timeZone).format('MM/DD/YYYY HH:mm')).toDate();
                }

                if(this.object.clockOut) {
                    this.object.clockOutAtStoreTimezone = moment(moment.tz(this.object.clockOut, this.store.timeZone).format('MM/DD/YYYY HH:mm')).toDate();
                }
            });
        });

        Observable.combineLatest(
            CommonAdapter(this.userService, 'id', (user) => `${user.firstName} ${user.lastName}`)
        ).toPromise()
            .then(([UserAdapter]) => {
                this.userSelect2Options = {
                    ajax: {},
                    placeholder: 'Select a User'
                };
                this.userSelect2Options['dataAdapter'] = UserAdapter;
            })
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    calculateTimeWorked() : string{

        let clockIn = moment(this.object.clockIn);
        let clockOut = this.object.clockOut ? moment(this.object.clockOut) : moment();

        let hours = clockOut.diff(clockIn, 'hours');
        let minutes = clockOut.diff(clockIn, 'minutes') % 60;

        return `${hours} hours ${minutes} minutes`;

    }

    resetErrorFlags(){
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    save(){

        this.resetErrorFlags();

        let errors = [];

        var clockInString = moment(this.object.clockInAtStoreTimezone).format('MM/DD/YYYY HH:mm:ss L');
        this.object.clockIn = moment.tz(clockInString, 'MM/DD/YYYY HH:mm:ss L', this.store.timeZone).utc().format('YYYY-MM-DDTHH:mm:ssZ');

        if (this.object.clockOutAtStoreTimezone) {
            var clockOutString = moment(this.object.clockOutAtStoreTimezone).format('MM/DD/YYYY HH:mm:ss L');
            this.object.clockOut = moment.tz(clockOutString, 'MM/DD/YYYY HH:mm:ss L', this.store.timeZone).utc().format('YYYY-MM-DDTHH:mm:ssZ');
        }

        if(this.object.clockOut) {
            if (new Date(this.object.clockIn) > new Date(this.object.clockOut)) {
                errors.push('Clock in time cannot be after clock out time.');
                this.errorFlags.timeClockIn = true;
            }
        }

        if (new Date(this.object.clockIn) > new Date()) {
            errors.push('Clock in time cannot be in the future.');
            this.errorFlags.timeClockIn = true;
        }

        if (this.object.clockOut && new Date(this.object.clockOut) > new Date()) {
            errors.push('Clock out time cannot be in the future.');
            this.errorFlags.timeClockOut = true;
        }

        if(!this.object.userId){
            errors.push('Cannot create time clock without a user');
            this.errorFlags.user = true;
        }

        if(errors.length){
            this.errors = errors;
            return;
        }

        this.timeClockService.save(this.object);
        this.timeClockService.list();

    }

    edit(){
        this.timeClockService.edit(this.object);
    }

    remove(){
        this.removalNeedsPin = true;
    }

    cancelRemoval(){
        this.removalNeedsPin = false;
    }

    async completeRemoval(){
        let confirmed = await this.userService.confirmManagerPin(this.managerPin);
        this.pinCorrect = confirmed;
        if(confirmed){
            //Do removal
            this.timeClockService.remove(this.object);
        }
    }

    cancel(){
        this.timeClockService.list();
    }

    get timeWorked(){
        if (this.object.clockInAtStoreTimezone) {
            let clockIn = moment(this.object.clockInAtStoreTimezone);
            let clockOut = this.object.clockOutAtStoreTimezone ? moment(this.object.clockOutAtStoreTimezone) : moment();

            let hours = clockOut.diff(clockIn, 'hours');
            let minutes = clockOut.diff(clockIn, 'minutes') % 60;

            return `${hours} hours ${minutes} minutes`;
        } else if(this.object.clockIn) {
            let clockIn = moment(this.object.clockIn);
            let clockOut = this.object.clockOut ? moment(this.object.clockOut) : moment();

            let hours = clockOut.diff(clockIn, 'hours');
            let minutes = clockOut.diff(clockIn, 'minutes') % 60;

            return `${hours} hours ${minutes} minutes`;
        }else{
            return '';
        }
    }


}
