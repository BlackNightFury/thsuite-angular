import {Component, Injector, OnInit} from "@angular/core";
import {ITimeClock} from "../../../models/interfaces/time-clock.interface";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {TimeClockService} from "../../../services/time-clock.service";
import {Subscription} from "rxjs/Subscription";

import {didSet} from "../../../lib/decorators/property/didSet";
import * as moment from 'moment';
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {UserService} from "../../../services/user.service";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

export function didSetSelectedEmployees(newValue) {
    this.extraFilters.next({
        userId: newValue
    });
}

@Component({
    selector: 'app-time-clocks-index',
    templateUrl: './time-clocks-index.component.html',
    styleUrls: [ './time-clocks-index.component.css' ]
})
export class TimeClocksIndexComponent extends ObjectsIndexComponent<ITimeClock> implements OnInit{

    @didSet(didSetSelectedEmployees) selectedEmployees: string;

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(injector: Injector, private timeClockService: TimeClockService, private storeService: StoreService){
        super(injector, timeClockService);
    }

    employeeSelect2Options: Select2Options;

    ngOnInit(){
        super.ngOnInit();

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        });

        CommonAdapter(this.userService, 'id', user => `${user.firstName} ${user.lastName}`)
            .then(UserAdapter => {

                this.employeeSelect2Options = {
                    ajax: {},
                    allowClear: true,
                    placeholder: "Employee Filter",
                    dropdownCssClass: 'compact'
                };
                this.employeeSelect2Options['dataAdapter'] = UserAdapter;
            });

        // this.objects.subscribe( objects => {
        //     const employees = objects.reduce( (memo,object) => Object.assign( memo, { [object.User.id]: `${object.User.firstName} ${object.User.lastName}` } ), { } )
        //     this.employeeSelect2Options = undefined
        //     setTimeout( () => {
        //         this.employeeSelect2Options = {
        //             placeholder: 'Employee',
        //             data: [ { id: 'all', text: 'All' } ].concat( Object.keys( employees ).map( id => ( { id, text: employees[id] } ) ) )
        //         }
        //     }, 60 )
        // } )

    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    calculateTimeWorked(object: ITimeClock) : string{

        let clockIn = moment(object.clockIn);
        let clockOut = object.clockOut ? moment(object.clockOut) : moment();

        let hours = clockOut.diff(clockIn, 'hours');
        let minutes = clockOut.diff(clockIn, 'minutes') % 60;

        return `${hours} hours ${minutes} minutes`;

    }

    onRowClick(event, timeClock: ITimeClock){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewTimeClock(timeClock);
    }

    viewTimeClock(timeClock: ITimeClock){
        this.timeClockService.view(timeClock);
    }

    editTimeClock(timeClock: ITimeClock){
        this.timeClockService.edit(timeClock);
    }

    createTimeClock(){
        this.timeClockService.create();
    }

    listTimeClocks(){
        this.timeClockService.list();
    }

}
