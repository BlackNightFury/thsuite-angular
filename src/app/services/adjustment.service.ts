import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {IAdjustment} from "../models/interfaces/adjustment.interface";
import {Adjustment} from "../models/adjustment.model";
import {PackageService} from "./package.service";
import {AdjustmentLogService} from "./adjustment-log.service";
import {UserService} from "./user.service";

@Injectable()
export class AdjustmentService extends CommonService<IAdjustment>{

    private packageService: PackageService;
    private userService: UserService;
    private adjustmentLogService: AdjustmentLogService;

    constructor(injector: Injector){
        super(injector, 'adjustments');

        setTimeout(() => {
            this.packageService = injector.get<PackageService>(PackageService);
            this.userService = injector.get<UserService>(UserService);
            this.adjustmentLogService = injector.get<AdjustmentLogService>(AdjustmentLogService);
        })
    }

    newInstance(){
        return new Adjustment({
            id: uuid.v4(),
            version: 0,
            userId: '',
            packageId: '',

            amount: 0,
            reason: '',
            notes: '',
            date: new Date()
        });
    }

    dbInstance(fromDb: IAdjustment) {
        return new Adjustment(fromDb);
    }

    instanceForSocket(object: IAdjustment) {
        return {
            id: object.id,
            version: object.version,
            userId: object.userId,
            packageId: object.packageId,

            amount: object.amount,
            reason: object.reason,
            notes: object.notes,
            date: object.date
        }
    }

    refresh(adjustment: IAdjustment){
        super.refresh(adjustment);

        this.packageService.refreshAssociations(adjustment.packageId);
    }

    getByPackageId(packageId: string): Observable<ObjectObservable<IAdjustment>[]>{
        let results = new Subject<ObjectObservable<IAdjustment>[]>();
        this.socket.emitPromise('getByPackageId', packageId)
            .then(adjustmentIds => {
                results.next(adjustmentIds.map(id => this.getAssociated(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    resolveAssociations(adjustment: IAdjustment, scopes: Array<string> = ['user', 'adjustmentLog']): ObjectObservable<IAdjustment>{

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'user': {
                'User': () => adjustment.userId ? this.userService.get(adjustment.userId) : Observable.of(undefined)
            },
            'adjustmentLog': {
                'AdjustmentLog': () => this.adjustmentLogService.getByAdjustmentId(adjustment.id)
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(adjustment), adjustment.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(adjustment, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, adjustment.id);
    }

    save(adjustment: IAdjustment, callback?, skipNotification?){
        //Saving adjustments should always alert on error
        super.save(adjustment, callback, skipNotification, true);
    }
}
