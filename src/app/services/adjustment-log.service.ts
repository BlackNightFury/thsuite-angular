import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {IAdjustmentLog} from "../models/interfaces/adjustment-log.interface";
import {AdjustmentLog} from "../models/adjustment-log.model";
import {AdjustmentService} from "./adjustment.service";

@Injectable()
export class AdjustmentLogService extends CommonService<IAdjustmentLog>{

    private adjustmentService: AdjustmentService;

    constructor(injector: Injector){
        super(injector, 'adjustment-logs');

        setTimeout(() => {
            this.adjustmentService = injector.get<AdjustmentService>(AdjustmentService);
        })
    }

    newInstance(){
        return new AdjustmentLog({
            id: uuid.v4(),
            version: 0,
            adjustmentId: '',
            quantityAfter: 0,
            quantityBefore: 0
        });
    }

    dbInstance(fromDb: IAdjustmentLog) {
        return new AdjustmentLog(fromDb);
    }

    instanceForSocket(object: IAdjustmentLog) {
        return {
            id: object.id,
            version: object.version,
            adjustmentId: object.adjustmentId,
            quantityAfter: object.quantityAfter,
            quantityBefore: object.quantityBefore
        }
    }

    refresh(adjustmentLog: IAdjustmentLog){
        super.refresh(adjustmentLog);

        this.adjustmentService.refreshAssociations(adjustmentLog.adjustmentId);
    }

    getByAdjustmentId(adjustmentId: string): Observable<ObjectObservable<IAdjustmentLog>>{
        let results = new Subject<ObjectObservable<IAdjustmentLog>>();
        this.socket.emitPromise('getByAdjustmentId', adjustmentId)
            .then(adjustmentLog => {
                results.next(adjustmentLog)
                // results.next(adjustmentIds.map(id => this.getAssociated(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    resolveAssociations(adjustmentLog: IAdjustmentLog): ObjectObservable<IAdjustmentLog>{

        return new ObjectObservable(Observable.of(adjustmentLog), adjustmentLog.id);
        /*
        let obs = Observable.combineLatest(
            adjustmentLog.adjustmentId ? this.adjustmentService.get(adjustmentLog.adjustmentId) : Observable.of(undefined),
            (adjustment => {
                adjustmentLog.Adjustment = adjustment;
                return adjustmentLog;
            })
        );

        return new ObjectObservable(obs, adjustmentLog.id);
        */
    }

    save(adjustmentLog: IAdjustmentLog, callback?, skipNotification?){
        super.save(adjustmentLog, callback, skipNotification);
    }

}
