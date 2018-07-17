import {CommonService} from "./common.service";
import {PatientService} from "./patient.service";
import {IPatientOversaleLimit} from "../models/interfaces/patient-oversale-limit.interface";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {PatientOversaleLimit} from "../models/patient-oversale-limit.model";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Injectable, Injector} from "@angular/core";
import {IPatient} from "../models/interfaces/patient.interface";
import {IStore} from "../models/interfaces/store.interface";
import { PosCartService } from "./pos-cart.service";

@Injectable()
export class PatientOversaleLimitService extends CommonService<IPatientOversaleLimit> {

    constructor(injector: Injector, socketService: SocketService, private cartService: PosCartService) {
        super(injector, 'patient-oversale-limits');
    }

    newInstance(): IPatientOversaleLimit {
        throw new Error('Oversale limits cannot be created on frontend');
    }


    dbInstance(fromDb: IPatientOversaleLimit) {
        return new PatientOversaleLimit(fromDb);
    }

    instanceForSocket(object: IPatientOversaleLimit): IPatientOversaleLimit {
        return {
            id: object.id,
            version: object.version,
            patientId: object.patientId,
            cartMax: object.cartMax,
            // buds: object.buds,
        };
    }

    check(cart, patient: IPatient, store: IStore): Observable<boolean> {
        console.log(cart);

        const result = new Subject<boolean>();
        this.socket.emitPromise('getByPatientMedicalId', PatientService.formatPatientMedicalId(patient.medicalStateId), store.licenseNumber)
            .then((oversaleLimits) => {

                console.log('oversaleLimits', oversaleLimits);

                const cartLimit = oversaleLimits.cartMax;

                const thcGrams = this.cartService.getThcGramsUsed();

                console.log('cart thc limit', cartLimit);
                console.log('current cart thcGrams', thcGrams);

                result.next(!!(thcGrams && (+thcGrams - cartLimit) > 0.001));
            }).catch( e => {
                console.log("GUEST PATIENT or INVALID med id. No THC items allowed");
                const thcGrams = this.cartService.getThcGramsUsed();
                result.next(thcGrams > 0);
            });

        return result.asObservable();
    }

}
