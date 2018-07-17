import {IPricingTierWeight} from "./interfaces/pricing-tier-weight.interface";
export class PricingTierWeight implements IPricingTierWeight{
    id: string;
    version: number;

    pricingTierId: string;

    weight: number;
    price: number;

    totalPrice?: string;

    readOnly: number;

    constructor(obj: IPricingTierWeight){
        Object.assign(this, obj);
    }
}
