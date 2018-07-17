import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {Router} from "@angular/router";
import {SocketService} from "../lib/socket";
import {IDrawerLog} from "../models/interfaces/drawer-log.interface";
import {DrawerLog} from "../models/drawer-log.model";
import {ObjectObservable} from "app/lib/object-observable";
import {UserService} from "./user.service";
import {SortBy} from "../util/directives/sort-table-header.directive";

@Injectable()
export class DrawerLogService extends CommonService<IDrawerLog> {

    private userService: UserService;

    constructor(
        injector: Injector
    ) {
        super(injector, 'drawer-logs');

        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
        })
    }

    insert(drawerLog: IDrawerLog): Promise<any>{
        return this.socket.emitPromise('create', {drawerLog});
    }

    getByDrawerId(drawerId: string): Observable<IDrawerLog[]> {
        let subject = new Subject<IDrawerLog[]>();

        this.socket.emitPromise('getByDrawerId', {drawerId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable()
    }

    newInstance(): IDrawerLog {
        return new DrawerLog({
            id: uuid.v4(),
            version: 0,
            drawerId: '',
            createdAt: new Date(),
            event: ''
        })
    }

    dbInstance(fromDb: IDrawerLog) {
        return new DrawerLog(fromDb);
    }

    instanceForSocket(object: IDrawerLog) {
        return {
            id: object.id,
            version: object.version,

            drawerId: object.drawerId,
            createdAt: object.createdAt,
            event: object.event
        }
    }
}
