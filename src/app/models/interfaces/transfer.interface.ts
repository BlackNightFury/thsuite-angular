import {ICommon} from "./common.interface";
import {ISupplier} from "./supplier.interface";

export interface ITransfer extends ICommon {
    type: string;
    ManifestNumber: number;
    supplierId: string;

    EstimatedArrivalDateTime: Date;

    DeliveryPackageCount: number;
    DeliveryReceivedPackageCount: number;

    CreatedByUserName: string;

    ReceivedDateTime: Date;

    Supplier?: ISupplier;

}
