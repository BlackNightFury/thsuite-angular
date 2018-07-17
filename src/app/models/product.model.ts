import {IProduct} from "./interfaces/product.interface";
import {IProductType} from "./interfaces/product-type.interface";
import {IStore} from "./interfaces/store.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IItem} from "./interfaces/item.interface";
import {IPricingTier} from "./interfaces/pricing-tier.interface";
import {ITag} from "./interfaces/tag.interface";

export class Product implements IProduct {
    id: string;
    version: number;

    clientId: string;

    storeId: string;
    Store?: IStore;

    name: string;
    description: string;
    image: string;

    inventoryType: 'weight'|'each';

    productTypeId: string;
    ProductType?: IProductType;

    itemId: string;
    Item?: IItem;

    pricingTierId: string;
    PricingTier?: IPricingTier;

    ProductVariations?: IProductVariation[];

    eligibleForDiscount: boolean;
    displayOnMenu: boolean;

    Tags?: ITag[];

    constructor(obj: IProduct) {
        Object.assign(this, obj);
    }

    get isLowOnBarcodes() {
        const hasThreshold = this.Store && this.Store.settings && this.Store.settings.lowBarcodeThreshold

        if( !this.ProductVariations || !hasThreshold ) return false

        const totalBarcodes =
            this.ProductVariations.reduce((sum,productVariation) => {
                if( !productVariation.Barcodes ) return sum
                return productVariation.Barcodes.reduce((memo,barcode) => memo + barcode.remainingInventory,0)
            }, 0 )

        return Boolean( totalBarcodes < this.Store.settings.lowBarcodeThreshold )
    }
}
