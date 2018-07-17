import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import {IProduct} from "../models/interfaces/product.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ISavedCart} from "../models/interfaces/saved-cart.interface";
import {SavedCart} from "../models/saved-cart.model";
import {Router} from "@angular/router";


@Injectable()
export class SavedCartService extends CommonService<ISavedCart> {

    constructor(injector: Injector) {
        super(injector, 'saved-carts');
    }

    newInstance() {
        return new SavedCart({
            id: uuid.v4(),
            version: 0,
            patientId: '',
            patientQueueId: '',
            cartData: '',
        });
    }
    dbInstance(fromDb: ISavedCart) {
        return new SavedCart(fromDb);
    }

    instanceForSocket(object: ISavedCart): ISavedCart{
        return {
            id: object.id,
            version: object.version,
            patientId: object.patientId,
            patientQueueId: object.patientQueueId,
            cartData: object.cartData,
        }
    }

    save(savedCart: ISavedCart, callback?, skipNotification?) {
        super.save(savedCart, callback, skipNotification);

        // this.router.navigate(['admin', 'inventory', 'suppliers']);
    }

    getByPatientQueueId(patientQueueId: string): Observable<ISavedCart>{
        let subject = new Subject<ISavedCart>();

        this.socket.emitPromise('getByPatientQueueId', patientQueueId)
            .then(id => {
                id ? this.get(id).subscribe(subject) : null;
            });

        return subject.asObservable();
    }
}
