import {IPricingTier} from "./interfaces/pricing-tier.interface";
import {IPricingTierWeight} from "./interfaces/pricing-tier-weight.interface";
export class PricingTier implements IPricingTier{
    id: string;
    version: number;

    name: string;
    description: string;
    mode: string;

    PricingTierWeights?: IPricingTierWeight[];

    constructor(obj: IPricingTier){
        Object.assign(this, obj);
        this.PricingTierWeights = obj.PricingTierWeights ? obj.PricingTierWeights.slice() : [];
    }
}
