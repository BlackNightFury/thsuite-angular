import {PricingTier} from "../models/pricing-tier.model";
import {IPricingTier} from "../models/interfaces/pricing-tier.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {Injectable, Injector} from "@angular/core";
import {SearchableService} from "./searchable.service";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Observable} from "rxjs/Observable";
import {SearchResult} from "../lib/search-result";
import {Mixin} from "../lib/decorators/class/mixin";
import {ObjectObservable} from "../lib/object-observable";
import {PricingTierWeightService} from "./pricing-tier-weight.service";
import {IPricingTierWeight} from "../models/interfaces/pricing-tier-weight.interface";

@Injectable()
@Mixin([SearchableService])
export class PricingTierService extends CommonService<IPricingTier> implements SearchableService<IPricingTier>{

    constructor(injector: Injector, private pricingTierWeightService: PricingTierWeightService){
        super(injector, 'pricing-tiers')
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IPricingTier>>;

    newInstance(){
        let pricingTier = new PricingTier({
            id: uuid.v4(),
            version: 0,

            name: '',
            description: '',
            mode: 'mix-match',
            PricingTierWeights: []
        });

        let baseWeight = this.pricingTierWeightService.newInstance();
        baseWeight.pricingTierId = pricingTier.id;
        baseWeight.readOnly = 1;

        pricingTier.PricingTierWeights.push(baseWeight);

        return pricingTier;
    }

    dbInstance(fromDb: IPricingTier){
        return new PricingTier(fromDb);
    }

    instanceForSocket(object: IPricingTier) {
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            mode: object.mode,
            description: object.description
        }
    }

    resolveAssociations(pricingTier: IPricingTier): ObjectObservable<IPricingTier>{
        let obs = Observable.combineLatest(
            this.pricingTierWeightService.getByPricingTierId(pricingTier.id)
        ).switchMap(([pricingTierWeightObservables]) => {

            if(!pricingTierWeightObservables.length){
                pricingTier.PricingTierWeights = [];
                return Observable.of(pricingTier);
            }

            return Observable.combineLatest(pricingTierWeightObservables, (...pricingTierWeights: IPricingTierWeight[]) => {

                pricingTierWeights.sort((a,b) => {
                    return a.weight - b.weight
                });

                pricingTier.PricingTierWeights = pricingTierWeights;

                return pricingTier;
            })
        });

        return new ObjectObservable(obs, pricingTier.id);
    }

    create(){
        this.router.navigate(['admin', 'inventory', 'pricing-tiers', 'add']);
    }

    edit(tier: IPricingTier){
        this.router.navigate(['admin', 'inventory', 'pricing-tiers', 'edit', tier.id]);
    }

    view(tier: IPricingTier){
        this.router.navigate(['admin', 'inventory', 'pricing-tiers', 'view', tier.id]);
    }

    list(){
        this.router.navigate(['admin', 'inventory', 'pricing-tiers']);
    }

    canRemove(tier: IPricingTier) : Promise<boolean>{
        return this.socket.emitPromise('canRemove', tier.id);
    }

    remove(tier: IPricingTier){
        this.socket.emitPromise('remove', tier.id);
        this.router.navigate(['admin', 'inventory', 'pricing-tiers']);
    }
}
