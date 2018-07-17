import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {PackageService} from "./package.service";
import {IPackagePriceAdjustment} from "../models/interfaces/package-price-adjustment.interface";
import {PackagePriceAdjustment} from "../models/package-price-adjustment.model";
import {UserService} from "./user.service";

@Injectable()
export class PackagePriceAdjustmentService extends CommonService<IPackagePriceAdjustment>{

    private packageService: PackageService;
    private userService: UserService;

    constructor(injector: Injector){
        super(injector, 'package-price-adjustments');

        setTimeout(() => {
            this.packageService = injector.get<PackageService>(PackageService);
            this.userService = injector.get<UserService>(UserService);
        })
    }

    newInstance(){
        return new PackagePriceAdjustment({
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

    dbInstance(fromDb: IPackagePriceAdjustment) {
        return new PackagePriceAdjustment(fromDb);
    }

    instanceForSocket(object: IPackagePriceAdjustment) {
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

    refresh(adjustment: IPackagePriceAdjustment){
        super.refresh(adjustment);

        this.packageService.refreshAssociations(adjustment.packageId);
    }

    getByPackageId(packageId: string): Observable<ObjectObservable<IPackagePriceAdjustment>[]>{
        let results = new Subject<ObjectObservable<IPackagePriceAdjustment>[]>();
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

    resolveAssociations(adjustment: IPackagePriceAdjustment): ObjectObservable<IPackagePriceAdjustment>{

        let obs = Observable.combineLatest(
            adjustment.userId ? this.userService.get(adjustment.userId) : Observable.of(undefined),
            (user => {
                adjustment.User = user;
                return adjustment;
            })
        );

        return new ObjectObservable(obs, adjustment.id);

    }

    save(adjustment: IPackagePriceAdjustment, callback?, skipNotification?){
        super.save(adjustment, callback, skipNotification);
    }

}
