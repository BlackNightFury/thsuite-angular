import {IDelivery} from "./interfaces/delivery.interface";
import {ITransfer} from "./interfaces/transfer.interface";

export class Delivery implements IDelivery {

    id: string;
    version: number;

    transferId: string;
    Transfer?: ITransfer;

    MetrcId: number;

    RecipientFacilityName: string;

    constructor(obj: IDelivery) {
        Object.assign(this, obj);
    }
}
