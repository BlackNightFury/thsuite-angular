import {Injectable, Injector} from "@angular/core";
import {CommonService} from "./common.service";
import {SearchableService} from "./searchable.service";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {ITimeClock} from "../models/interfaces/time-clock.interface";
import {TimeClock} from "../models/time-clock.model";
import * as uuid from "uuid";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {UserService} from "./user.service";
import {ObjectObservable} from "../lib/object-observable";
import {Mixin} from "../lib/decorators/class/mixin";
import {Subject} from "rxjs/Subject";
import {DateRange} from "../lib/date-range";

@Injectable()
@Mixin([SearchableService])
export class TimeClockService extends CommonService<ITimeClock> implements SearchableService<ITimeClock>{

    constructor(injector: Injector, private userService: UserService){
        super(injector, 'time-clocks');
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<ITimeClock>>;

    newInstance(){
        return new TimeClock({
            id: uuid.v4(),
            version: 0,

            userId: '',

            clockIn: null,
            clockOut: null,

            autoClockedOut: false
        });
    }

    dbInstance(fromDb: ITimeClock){
        return new TimeClock(fromDb);
    }

    instanceForSocket(object: ITimeClock): ITimeClock{
        return {
            id: object.id,
            version: object.version,

            userId: object.userId,
            clockIn: object.clockIn,
            clockOut: object.clockOut,
            autoClockedOut: object.autoClockedOut
        };
    }

    getMostRecentActiveForUser(userId: string): Observable<ITimeClock>{

        let subject = new Subject<ITimeClock>();

        this.socket.emitPromise('getMostRecentActiveForUser', userId)
            .then((timeClockId) => {
                if(!timeClockId){
                    subject.next(undefined);
                }else{
                    this.get(timeClockId).subscribe(subject);
                }
            })
            .catch((err) => {
                console.log('err: ');
                console.log(err);
            });

        return subject.asObservable();

    }

    getByUserId(userId: string, dateRange: DateRange): Observable<ObjectObservable<ITimeClock>[]>{
        let results = new Subject<ObjectObservable<ITimeClock>[]>();
        this.socket.emitPromise('getByUserId', {userId, dateRange})
            .then(timeClockIds => {
                results.next(timeClockIds.map(id => this.get(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    getMostRecentForAllUsers(){
        let subject = new Subject<Map<string, ITimeClock>>();

        this.socket.emitPromise('getMostRecentForAllUsers')
            .then((userTimeClocks) => {
                let timeClockMap = new Map<string, ITimeClock>();
                Object.keys(userTimeClocks).forEach(userId => {
                    timeClockMap.set(userId, userTimeClocks[userId]);
                });
                subject.next(timeClockMap);
            })
            .catch((err) => {
                console.log('err: ');
                console.log(err);
            });

        return subject.asObservable();
    }

    resolveAssociations(timeClock: ITimeClock): ObjectObservable<ITimeClock>{
        let obs = Observable.combineLatest(
            timeClock.userId ? this.userService.getAssociated(timeClock.userId) : Observable.of(undefined)
        ).map(([user]) => {

            timeClock.User = user;
            return timeClock;
        });

        return new ObjectObservable(obs, timeClock.id);

    }

    goToPosClockIn(){
        this.router.navigate(['pos', 'settings', 'time-clock']);
    }

    create(){
        this.router.navigate(['admin', 'store', 'time-clocks', 'add']);
    }

    edit(timeClock: ITimeClock){
        this.router.navigate(['admin', 'store', 'time-clocks', 'edit', timeClock.id]);
    }

    view(timeClock: ITimeClock){
        this.router.navigate(['admin', 'store', 'time-clocks', 'view', timeClock.id]);
    }

    list(){
        this.router.navigate(['admin', 'store', 'time-clocks']);
    }

    remove(timeClock: ITimeClock){
        this.socket.emitPromise('remove', timeClock.id);
        this.router.navigate(['admin', 'store', 'time-clocks']);
    }

    overallReport(args) {
        return this.socket.emitPromise('overall-report',args)
    }
}
