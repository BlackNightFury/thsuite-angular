import {ICommon} from "./common.interface";
import {IPricingTierWeight} from "./pricing-tier-weight.interface";
export interface IPricingTier extends ICommon{
    name: string;
    description: string;
    mode: string;

    PricingTierWeights?: IPricingTierWeight[];
}
