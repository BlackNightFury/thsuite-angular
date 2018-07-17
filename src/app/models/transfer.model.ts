import {ITransfer} from "./interfaces/transfer.interface";

export class Transfer implements ITransfer {

    id: string;
    version: number;

    type: string;
    ManifestNumber: number;
    supplierId: string;

    EstimatedArrivalDateTime: Date;

    DeliveryPackageCount: number;
    DeliveryReceivedPackageCount: number;

    CreatedByUserName: string;

    ReceivedDateTime: Date;

    constructor(obj?: ITransfer) {
        Object.assign(this, obj);
    }

}
