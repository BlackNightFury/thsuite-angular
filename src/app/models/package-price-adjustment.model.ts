import {IPackagePriceAdjustment} from "./interfaces/package-price-adjustment.interface";
import {IUser} from "./interfaces/user.interface";

export class PackagePriceAdjustment implements IPackagePriceAdjustment{
    id: string;
    version: number;

    userId: string;
    User?: IUser;
    packageId: string;

    amount: number;
    reason: string;
    notes: string;

    date: Date;

    adjustedAmount?: number;

    constructor(obj: IPackagePriceAdjustment) {
        Object.assign(this, obj);
    }
}
