import {IDeliveryPackage} from "./interfaces/delivery-package.interface";
import {IDelivery} from "./interfaces/delivery.interface";

export class DeliveryPackage implements IDeliveryPackage {

    id: string;
    version: number;

    deliveryId: string;
    Delivery?: IDelivery;
    
    packageId: string;

    MetrcPackageId: number;

    PackageLabel: string;

    ShippedQuantity: number;
    ShippedUnitOfMeasureName: string;
    ReceivedQuantity: number;
    ReceivedDateTime: Date;

    constructor(obj: IDeliveryPackage) {
        Object.assign(this, obj);
    }
}
