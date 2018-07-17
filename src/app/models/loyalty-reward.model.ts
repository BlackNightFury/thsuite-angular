import {ILoyaltyReward} from "./interfaces/loyalty-reward.interface";
import {ITag} from "./interfaces/tag.interface";
export class  LoyaltyReward implements ILoyaltyReward{

    id: string;
    version: number;

    name: string;
    points:number;

    discountAmountType: string;
    discountAmount: number;

    appliesTo: string;

    numItems: number;

    isActive: boolean;

    Tags?: ITag[];

    constructor(obj?: ILoyaltyReward){
        Object.assign(this, obj);
    }

}
