import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {PackageService} from "./package.service";
import {ReceiptService} from "./receipt.service";
import {IReceiptAdjustment} from "../models/interfaces/receipt-adjustment.interface";
import {ReceiptAdjustment} from "../models/receipt-adjustment.model";
import {UserService} from "./user.service";

@Injectable()
export class ReceiptAdjustmentService extends CommonService<IReceiptAdjustment>{

    private packageService: PackageService;
    private receiptService: ReceiptService;
    private userService: UserService;

    constructor(injector: Injector){
        super(injector, 'receipt-adjustments');

        setTimeout(() => {
            this.packageService = injector.get<PackageService>(PackageService);
            this.receiptService = injector.get<ReceiptService>(ReceiptService);
            this.userService = injector.get<UserService>(UserService);
        })
    }

    newInstance(){
        return new ReceiptAdjustment({
            id: uuid.v4(),
            version: 0,
            userId: '',
            packageId: '',
            receiptId: '',

            amount: 0,
            reason: '',
            notes: '',
            date: new Date()
        });
    }

    dbInstance(fromDb: IReceiptAdjustment) {
        return new ReceiptAdjustment(fromDb);
    }

    instanceForSocket(object: IReceiptAdjustment) {
        return {
            id: object.id,
            version: object.version,

            userId: object.userId,
            packageId: object.packageId,
            receiptId: object.receiptId,

            amount: object.amount,
            reason: object.reason,
            notes: object.notes,
            date: object.date
        }
    }

    refresh(adjustment: IReceiptAdjustment){
        super.refresh(adjustment);

        this.packageService.refreshAssociations(adjustment.packageId);
    }

    getByPackageId(packageId: string): Observable<ObjectObservable<IReceiptAdjustment>[]>{
        let results = new Subject<ObjectObservable<IReceiptAdjustment>[]>();
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

    resolveAssociations(adjustment: IReceiptAdjustment): ObjectObservable<IReceiptAdjustment>{

        let obs = Observable.combineLatest(
            adjustment.userId ? this.userService.get(adjustment.userId) : Observable.of(undefined),
            (user => {
                adjustment.User = user;
                return adjustment;
            })
        );

        return new ObjectObservable(obs, adjustment.id);

    }

    save(adjustment: IReceiptAdjustment, callback?, skipNotification?){
        super.save(adjustment, callback, skipNotification);
    }

}
