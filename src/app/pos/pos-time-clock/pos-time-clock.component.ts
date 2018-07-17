import {TimeClockService} from "../../services/time-clock.service";
import {Component, Injector, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";
import {ITimeClock} from "../../models/interfaces/time-clock.interface";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DateRange} from "../../lib/date-range";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {Observable} from "rxjs/Observable";
import * as moment from 'moment';
import {PrinterService} from "../../services/printer.service";
import {DeviceService} from "../../services/device.service";
import {StoreService} from "../../services/store.service";
import {IStore} from "../../models/interfaces/store.interface";
import {environment} from "../../../environments/environment";
@Component({
    selector: 'app-pos-time-clock',
    templateUrl: './pos-time-clock.component.html',
    styleUrls: ['./pos-time-clock.component.css']
})
export class PosTimeClockComponent implements OnInit{

    user: IUser;
    store: IStore;
    currentTimeClock: ITimeClock;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    historicalTimeClocks: Observable<ITimeClock[]>;

    isDeviceRegistered: boolean;

    userTimeClocks = [];

    hoursString: string = '00';
    minutesString: string = '00';
    secondsString: string = '00';
    secondsTotal: number = 0;
    timerIntervalId: any;

    timerRunning: boolean = false;

    environment = environment;

    pinRequired: boolean | string = false;
    userPin: string;
    userPinCorrect: boolean = true;
    confirmPinAction: () => void = () => null;

    constructor(
        injector: Injector,
        private timeClockService: TimeClockService,
        private storeService: StoreService,
        private userService: UserService,
        private printerService: PrinterService,
        private loadingBarService: SlimLoadingBarService,
        private deviceService: DeviceService
    ){

    }

    ngOnInit(){

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
                this.timeClockService.getMostRecentActiveForUser(this.user.id)
                    .subscribe(timeClock => {
                        console.log(timeClock);
                        if(!timeClock){
                            //User not clocked in
                        }else{
                            this.currentTimeClock = timeClock;
                            this.secondsTotal = moment().diff(moment(timeClock.clockIn), 'seconds');
                            //Start timer
                            this.timerRunning = true;
                            this.timer();
                        }
                    });


                Observable.combineLatest(
                    this.dateRangeSource,
                    this.timeClockService.refreshEmitted,
                    (dateRange) => {
                        return {
                            dateRange: dateRange
                        }
                    }
                ).do(() => {
                    this.loadingBarService.start();
                }).subscribe((searchTerms) => {
                    this.timeClockService.getByUserId(this.user.id, searchTerms.dateRange)
                        .subscribe(timeClocks => {
                            this.historicalTimeClocks = Observable.combineLatest(timeClocks);
                            this.loadingBarService.complete();
                        })
                })

            });

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        });

        this.timeClockService.getMostRecentForAllUsers()
            .subscribe(timeClocks => {
                let userIds = Array.from(timeClocks.keys()).filter(id => id != this.user.id);
                let userObs = userIds.map(userId => this.userService.get(userId));
                Observable.combineLatest(userObs)
                    .subscribe((users) => {
                        for(let user of users){
                            let timeClock = timeClocks.get(user.id);
                            this.userTimeClocks.push({
                                user: user,
                                timeClock: timeClock
                            });
                        }
                })
            })

        let deviceId = localStorage.getItem('deviceId');
        if(deviceId){
            this.deviceService.isRegistered(deviceId)
                .then(isRegistered => {
                    this.isDeviceRegistered = isRegistered;
                })
        }

    }
    clockIn(){
        this.currentTimeClock = this.timeClockService.newInstance();

        this.currentTimeClock.userId = this.user.id;
        this.currentTimeClock.clockIn = new Date();

        this.timeClockService.save(this.currentTimeClock);
        this.dateRangeSource.take(1).subscribe((dateRange) => {
            this.dateRangeSource.next(dateRange);
        });

        this.timerRunning = true;
        this.timer();
    }

    clockOut(){
        this.currentTimeClock.clockOut = new Date();

        this.timeClockService.save(this.currentTimeClock);

        this.printerService.printTimeClockReport(this.currentTimeClock, this.user, this.store);
        this.currentTimeClock = undefined;
        this.timerRunning = false;
    }

    clockInUser(timeClock){

        if(this.environment.shouldShowPinEntryUponClock) {

            this.pinRequired = timeClock.user.id;

            const clockInUser = (timeClock) => {
                let newClock = this.timeClockService.newInstance();
                newClock.userId = timeClock.user.id;
                newClock.clockIn = new Date();

                this.timeClockService.save(newClock);

                timeClock.timeClock = newClock;
            }

            this.confirmPinAction = () => clockInUser(timeClock);
        }else{
            let newClock = this.timeClockService.newInstance();
            newClock.userId = timeClock.user.id;
            newClock.clockIn = new Date();

            this.timeClockService.save(newClock);

            timeClock.timeClock = newClock;
        }
    }

    clockOutUser(timeClock){

        if(this.environment.shouldShowPinEntryUponClock){
            this.pinRequired = timeClock.user.id;

            const clockOutUser = (timeClock) => {
                timeClock.timeClock.clockOut = new Date();
                this.timeClockService.save(timeClock.timeClock);

                timeClock.timeClock = null;
            }

            this.confirmPinAction = () => clockOutUser(timeClock);
        }else{
            timeClock.timeClock.clockOut = new Date();
            this.timeClockService.save(timeClock.timeClock);

            timeClock.timeClock = null;
        }

    }

    shouldRequestPIN(user) {
        if (user.id === this.user.id) return false;
        return this.pinRequired === user.id
    }

    shouldAllowClock(user) {
        if (!this.isDeviceRegistered) return false;
        if (user.id === this.user.id) return true;
        if (user.pin === null && user.id !== this.user.id) return false;
        return !this.shouldRequestPIN(user)
    }

    userPinChanged() {
        if (this.userPin.length === 4) {
            this.confirmPin(this.pinRequired, this.userPin)
        }
    }

    clearPinRequest() {
        this.pinRequired = false;
        this.userPinCorrect = true;
        this.userPin = '';
        this.confirmPinAction = () => null;
    }

    async confirmPin(userId, pin) {
        let confirmed = await this.userService.confirmUserPin(userId, pin)
        if (confirmed) {
            this.confirmPinAction();
            this.clearPinRequest();
        } else {
            this.userPinCorrect = false;
        }
    }

    timer(){
        if(this.timerRunning) {
            let totalSeconds = Math.floor((Date.now() - (+moment(this.currentTimeClock.clockIn))) / 1000);
            this.secondsString = this.padTimerValues(totalSeconds % 60);
            this.minutesString = this.padTimerValues(Math.floor(totalSeconds / 60) % 60);
            this.hoursString = this.padTimerValues(Math.floor(totalSeconds / 3600));
            setTimeout(() => {
                this.timer();
            }, 1000)
        }
    }

    padTimerValues(value: number){
        let valueString = value + "";

        if(valueString.length < 2){
            return "0" + valueString;
        }else{
            return valueString;
        }
    }

}
