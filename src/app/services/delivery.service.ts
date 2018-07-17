import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ObjectObservable} from "../lib/object-observable";
import {CommonService} from "./common.service";
import {TransferService} from "./transfer.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {Mixin} from "../lib/decorators/class/mixin";
import {Delivery} from "../models/delivery.model";
import {IDelivery} from "../models/interfaces/delivery.interface";
import {Router} from "@angular/router";


@Injectable()
export class DeliveryService extends CommonService<IDelivery> {

    constructor(injector: Injector, private transferService: TransferService) {
        super(injector, 'deliveries');
    }

    newInstance() {
        return new Delivery({
            id: uuid.v4(),
            version: 0,
            transferId: '',
            MetrcId: null,
            RecipientFacilityName: ''
        });
    }


    dbInstance(fromDb: IDelivery) {
        return new Delivery(fromDb);
    }

    instanceForSocket(object: IDelivery) {
        return {
            id: object.id,
            version: object.version,

            transferId: object.transferId,
            MetrcId: object.MetrcId,
            RecipientFacilityName: object.RecipientFacilityName
        }
    }

    resolveAssociations(delivery: IDelivery): ObjectObservable<IDelivery> {

        let obs = Observable.combineLatest(
            this.transferService.get(delivery.transferId)
        ).map(([transfer]) => {
            delivery.Transfer = transfer;
            return delivery;
        });

        return new ObjectObservable(obs, delivery.id);

    }

}
