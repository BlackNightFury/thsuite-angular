import {ICommon} from "./common.interface";
import {IProductType} from "./product-type.interface";
import {IStore} from "./store.interface";
import {IProductVariation} from "./product-variation.interface";
import {IItem} from "./item.interface";
import {IPricingTier} from "./pricing-tier.interface";
import {ITag} from "./tag.interface";

export interface IProduct extends ICommon {

    clientId: string;

    storeId: string;
    Store?: IStore;

    name: string;
    description: string;
    image: string;

    inventoryType: 'weight'|'each';

    productTypeId: string;
    ProductType?: IProductType

    itemId: string;
    Item?: IItem;

    pricingTierId: string;
    PricingTier?: IPricingTier;

    ProductVariations?: IProductVariation[];

    eligibleForDiscount: boolean;
    displayOnMenu: boolean;

    Tags?: ITag[];
}
