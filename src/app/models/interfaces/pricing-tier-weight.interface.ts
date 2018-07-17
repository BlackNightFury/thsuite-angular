import {ICommon} from "./common.interface";
export interface IPricingTierWeight extends ICommon{
    pricingTierId: string;

    weight: number;
    price: number;

    totalPrice? :string;

    readOnly: number;
}
