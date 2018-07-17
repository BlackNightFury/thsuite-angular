import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ObjectObservable} from "../lib/object-observable";
import {CommonService} from "./common.service";
import {DeliveryService} from "./delivery.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {DeliveryPackage} from "../models/delivery-package.model";
import {SearchableService} from "./searchable.service";
import {SearchResult} from "../lib/search-result";
import {Router} from "@angular/router";
import {Mixin} from "../lib/decorators/class/mixin";
import {IDeliveryPackage} from "../models/interfaces/delivery-package.interface";


@Injectable()
export class DeliveryPackageService extends CommonService<IDeliveryPackage> {

    constructor(injector: Injector, private deliveryService: DeliveryService) {
        super(injector, 'delivery-packages');
    }

    getByPackageId(packageId: string, packageLabel: string): Observable<any> {
        let subject = new Subject<any>();

        this.socket.emitPromise('getByPackageId', {packageId,packageLabel})
            .then(id => {
                if( id === null ) return subject.next(null)
                this.getAssociated(id)
                    .subscribe(subject);
            });

        return subject.asObservable();
    }

    newInstance() {
        return new DeliveryPackage({
            id: uuid.v4(),
            version: 0,

            deliveryId: '',
            packageId: '',

            MetrcPackageId: 0,

            PackageLabel: '',

            ShippedQuantity: 0,
            ShippedUnitOfMeasureName: '',
            ReceivedQuantity: 0,
            ReceivedDateTime: null
        });
    }


    dbInstance(fromDb: IDeliveryPackage) {
        return new DeliveryPackage(fromDb);
    }

    instanceForSocket(object: IDeliveryPackage) {
        return {
            id: object.id,
            version: object.version,

            deliveryId: object.deliveryId,
            packageId: object.packageId,

            MetrcPackageId: object.MetrcPackageId,

            PackageLabel: object.PackageLabel,

            ShippedQuantity: object.ShippedQuantity,
            ShippedUnitOfMeasureName: object.ShippedUnitOfMeasureName,
            ReceivedQuantity: object.ReceivedQuantity,
            ReceivedDateTime: object.ReceivedDateTime
        }
    }

    resolveAssociations(deliveryPackage: IDeliveryPackage): ObjectObservable<IDeliveryPackage> {

        let obs = Observable.combineLatest(
            this.deliveryService.getAssociated(deliveryPackage.deliveryId)
        ).map(([delivery]) => {
            
            deliveryPackage.Delivery = delivery;
            return deliveryPackage;
        });

        return new ObjectObservable(obs, deliveryPackage.id);

    }

}
