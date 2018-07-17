import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, ReplaySubject, Subject, Subscription} from "rxjs";
import * as uuid from "uuid";

import {CommonService} from "./common.service";
import {IDrawerRemoval} from "../models/interfaces/drawer-removal.interface";
import {DrawerRemoval} from "../models/drawer-removal.model";
import {ObjectObservable} from "../lib/object-observable";
import {UserService} from "./user.service";
import {IPatient} from "../models/interfaces/patient.interface";
import {IAdjustment} from "../models/interfaces/adjustment.interface";
import {ISavedCart} from "../models/interfaces/saved-cart.interface";

@Injectable()
export class DrawerRemovalService extends CommonService<IDrawerRemoval> {
    private userService: UserService;

    constructor(injector: Injector) {
        super(injector, 'drawer-removals');

        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
        }, 0)
    }

    newInstance(): IDrawerRemoval {
        return new DrawerRemoval({
            id: uuid.v4(),
            version: 0,
            drawerId: '',
            userId: '',
            removedAmount: 0,
            createdAt: null
        })
    }

    dbInstance(fromDb: IDrawerRemoval) {
        return new DrawerRemoval(fromDb);
    }

    instanceForSocket(object: IDrawerRemoval) {
        return {
            id: object.id,
            version: object.version,
            drawerId: object.drawerId,
            userId: object.userId,
            removedAmount: object.removedAmount,
            createdAt: object.createdAt
        }
    }

    getByDrawerId(drawerId: string): Observable<IDrawerRemoval[]> {
        console.log("getting drawer removals");

        let subject = new Subject<IDrawerRemoval[]>();

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

    resolveAssociations(drawerRemoval: IDrawerRemoval, scopes: Array<string> = ['user']): ObjectObservable<IDrawerRemoval> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'user': {
                'User': () => drawerRemoval.userId ? this.userService.getAssociated(drawerRemoval.userId) : Observable.of(undefined)
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(drawerRemoval), drawerRemoval.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(drawerRemoval, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, drawerRemoval.id);
    }

    save(object: IDrawerRemoval, callback?: Function) {
        super.save(object, callback, false, false, 'Cash Removal Logged');
    }

}
