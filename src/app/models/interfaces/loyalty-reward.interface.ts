import {ICommon} from "./common.interface";
import {ITag} from "./tag.interface";
export interface ILoyaltyReward extends ICommon{

    name: string;
    points:number;

    discountAmountType: string;
    discountAmount: number;

    appliesTo: string;

    numItems: number;

    isActive: boolean;

    Tags?: ITag[];

}
