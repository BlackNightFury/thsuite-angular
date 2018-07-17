import {PricingTierWeight} from "../models/pricing-tier-weight.model";
import {IPricingTierWeight} from "../models/interfaces/pricing-tier-weight.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {Injectable, Injector} from "@angular/core";
import {ObjectObservable} from "../lib/object-observable";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {PricingTierService} from "./pricing-tier.service";

@Injectable()
export class PricingTierWeightService extends CommonService<IPricingTierWeight>{

    pricingTierService: PricingTierService;

    constructor(injector: Injector){
        super(injector, 'pricing-tier-weights');

        setTimeout(() => {
            this.pricingTierService = injector.get<PricingTierService>(PricingTierService);
        });
    }

    getByPricingTierId(pricingTierId: string): Observable<ObjectObservable<IPricingTierWeight>[]>{
        let results = new Subject<ObjectObservable<IPricingTierWeight>[]>();
        this.socket.emitPromise('getByPricingTierId', pricingTierId)
            .then(tierWeightIds => {
                results.next(tierWeightIds.map(id => this.get(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    newInstance(){
        return new PricingTierWeight({
            id: uuid.v4(),
            version: 0,

            pricingTierId: '',

            weight: 0,
            price: 0,
            readOnly: 0
        });
    }

    dbInstance(fromDb: IPricingTierWeight){
        return new PricingTierWeight(fromDb);
    }

    instanceForSocket(object: IPricingTierWeight) {
        return {
            id: object.id,
            version: object.version,

            pricingTierId: object.pricingTierId,

            weight: object.weight,
            price: object.price,
            readOnly: object.readOnly
        }
    }

    refresh(pricingTierWeight: IPricingTierWeight) {
        super.refresh(pricingTierWeight);

        this.pricingTierService.refreshAssociations(pricingTierWeight.pricingTierId);
    }

    deleteTierWeight(tierWeightId: string){
        this.socket.emitPromise('delete', tierWeightId)
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log('err: ');
                console.log(err);
            })
    }
}
