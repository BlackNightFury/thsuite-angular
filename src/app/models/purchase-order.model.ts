import {IPurchaseOrder} from "./interfaces/purchase-order.interface";
import {IUser} from "./interfaces/user.interface";

export class PurchaseOrder implements IPurchaseOrder{
    id: string;
    version: number;

    userId: string;
    User?: IUser;
    packageId: string;
    itemId: string;

    amount: number;
    price: number;
    notes: string;

    date: Date;

    // Virtual field
    newQuantity?: string;

    constructor(obj: IPurchaseOrder) {
        Object.assign(this, obj);
    }
}
