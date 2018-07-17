import {IPackage} from "./interfaces/package.interface";
import {IItem} from "./interfaces/item.interface";
import {IPackagePriceAdjustment} from "./interfaces/package-price-adjustment.interface";
import {IAdjustment} from "./interfaces/adjustment.interface";
import {IPurchaseOrder} from "./interfaces/purchase-order.interface";
import {ISupplier} from "./interfaces/supplier.interface";
import {IDeliveryPackage} from "./interfaces/delivery-package.interface";

export class Package implements IPackage {
    id: string;
    version: number;

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

    barcodeIds?: string[];
    hasPrices?: boolean;

    // Virtual attribute
    perUnitWholesalePrice?: number;

    constructor(obj: IPackage) {
        Object.assign(this, obj);

        this.perUnitWholesalePrice = (this.wholesalePrice / this.ReceivedQuantity);
        if(isNaN(this.perUnitWholesalePrice)){
            this.perUnitWholesalePrice = 0;
        }
    }

    get totalPriceAdjustment() {
        if( this.PriceAdjustments === undefined ) return 0

        return this.PriceAdjustments.reduce((curTotal, adjustment) => curTotal + adjustment.amount, 0)
    }

    get adjustedWholesalePrice() {
        return this.wholesalePrice - this.totalPriceAdjustment
    }

    get manifestNumber() {
        return this.DeliveryPackage && this.DeliveryPackage.Delivery && this.DeliveryPackage.Delivery.Transfer ? this.DeliveryPackage.Delivery.Transfer.ManifestNumber : (this.ManifestNumber ? this.ManifestNumber : 'None');
    }

    get hasBarcodes() {
        return this.barcodeIds && this.barcodeIds.length
    }

    get wasReceived() {
        // if( !this.DeliveryPackage || !this.DeliveryPackage.Delivery || !this.DeliveryPackage.Delivery.Transfer ||  !this.DeliveryPackage.Delivery.Transfer.ReceivedDateTime ) return false
        //
        // return true
        return !!this.ReceivedDateTime;
    }
}
