import {ICommon} from "./common.interface";
import {IDelivery} from "./delivery.interface";

export interface IDeliveryPackage extends ICommon {
    deliveryId: string;
    Delivery?: IDelivery;

    packageId: string;

    MetrcPackageId: number;

    PackageLabel: string;

    ShippedQuantity: number;
    ShippedUnitOfMeasureName: string;
    ReceivedQuantity: number;
    ReceivedDateTime: Date;

}
