import {IStore} from "./interfaces/store.interface";
import {IProductVariationItem} from "./interfaces/product-variation-item.interface";
import {IProductType} from "./interfaces/product-type.interface";
import {IPackage} from "./interfaces/package.interface";
import {IItem} from "./interfaces/item.interface";
import {ISupplier} from "./interfaces/supplier.interface";

export class ProductVariationItem implements IProductVariationItem {
    id: string;
    version: number;

    clientId: string;

    storeId: string;
    Store?: IStore;

    MetrcId: number;
    name: string;

    UnitOfMeasureName: string;
    UnitOfMeasureAbbreviation: string;

    productTypeId: string;
    ProductType?: IProductType;

    Packages?: IPackage[];

    supplierId: string;
    Supplier?: ISupplier;

    thcWeight: number;

    ProductVariationItem: {
        productVariationId: string;
        quantity: number;
    };

    constructor(obj: IItem, productVariationItem: {productVariationId: string, quantity: number}) {
        Object.assign(this, obj);

        this.ProductVariationItem = productVariationItem;
    }
}
