import {ICommon} from "./common.interface";
import {IItem} from "./item.interface";
import {IAdjustment} from "./adjustment.interface";
import {IPurchaseOrder} from "./purchase-order.interface";
import {IPackagePriceAdjustment} from "./package-price-adjustment.interface";
import {ISupplier} from "./supplier.interface";
import {IDeliveryPackage} from "./delivery-package.interface";
import {ILabTestResult} from "./lab-test-result.interface";

export interface IPackage extends ICommon {

    itemId: string;
    Item?: IItem;

    Adjustments?: IAdjustment[];
    PurchaseOrders?: IPurchaseOrder[];
    PriceAdjustments?: IPackagePriceAdjustment[];

    wholesalePrice: number;
    availableQuantity: number;

    Label: string;
    MetrcId: number;
    Quantity: number;
    ReceivedQuantity: number;
    UnitOfMeasureName: string;
    UnitOfMeasureAbbreviation: string;

    FinishedDate: Date;
    ReceivedDateTime: Date;
    ManifestNumber: string;

    //Details for bulk flower packaging
    thcPercent: number;
    cbdPercent: number;

    strainType: string;
    ingredients: string;

    supplierId: string;
    Supplier?: ISupplier;

    DeliveryPackage?: IDeliveryPackage;

    barcodeIds?: string[]
    hasPrices?: boolean;

    perUnitWholesalePrice?: number;

    LabTestResult?: ILabTestResult;
}
