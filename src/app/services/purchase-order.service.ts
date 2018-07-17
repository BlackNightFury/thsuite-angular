import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {IPurchaseOrder} from "../models/interfaces/purchase-order.interface";
import {PurchaseOrder} from "../models/purchase-order.model";
import {PackageService} from "./package.service";
import {UserService} from "./user.service";

@Injectable()
export class PurchaseOrderService extends CommonService<IPurchaseOrder>{

    private packageService: PackageService;
    private userService: UserService;

    constructor(injector: Injector){
        super(injector, 'purchase-orders');

        setTimeout(() => {
            this.packageService = injector.get<PackageService>(PackageService);
            this.userService = injector.get<UserService>(UserService);
        })
    }

    newInstance(){
        return new PurchaseOrder({
            id: uuid.v4(),
            version: 0,
            userId: '',
            packageId: '',
            itemId: '',
            amount: 0,
            price: 0,
            notes: '',
            date: new Date()
        });
    }

    dbInstance(fromDb: IPurchaseOrder) {
        return new PurchaseOrder(fromDb);
    }

    instanceForSocket(object: IPurchaseOrder) {
        return {
            id: object.id,
            version: object.version,
            userId: object.userId,
            packageId: object.packageId,
            itemId: object.itemId,

            amount: object.amount,
            price: object.price,
            notes: object.notes,
            date: object.date
        }
    }

    refresh(purchaseOrder: IPurchaseOrder){
        super.refresh(purchaseOrder);

        this.packageService.refreshAssociations(purchaseOrder.packageId);
        this.packageService.refreshAssociations(purchaseOrder.itemId);
    }

    getByPackageId(packageId: string): Observable<ObjectObservable<IPurchaseOrder>[]>{
        let results = new Subject<ObjectObservable<IPurchaseOrder>[]>();
        this.socket.emitPromise('getByPackageId', packageId)
            .then(purchaseOrderIds => {
                results.next(purchaseOrderIds.map(id => this.getAssociated(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    auditByItemId(itemId: string) {
        return this.socket.emitPromise('auditByItemId', itemId);
    }

    resolveAssociations(purchaseOrder: IPurchaseOrder, scopes: Array<string> = ['user']): ObjectObservable<IPurchaseOrder>{

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'user': {
                'User': () => purchaseOrder.userId ? this.userService.get(purchaseOrder.userId) : Observable.of(undefined)
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(purchaseOrder), purchaseOrder.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(purchaseOrder, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, purchaseOrder.id) as any;
    }

    save(purchaseOrder: IPurchaseOrder, callback?, skipNotification?){
        //Saving adjustments should always alert on error
        super.save(purchaseOrder, callback, skipNotification, true);
    }
}
