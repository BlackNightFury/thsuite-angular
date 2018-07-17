import {IBarcode} from "./interfaces/barcode.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IProduct} from "./interfaces/product.interface";
import {IStore} from "./interfaces/store.interface";
import {IProductVariationItem} from "./interfaces/product-variation-item.interface";
import {ITag} from "./interfaces/tag.interface";

export class ProductVariation implements IProductVariation {
    id: string;
    version: number;

    clientId: string;

    storeId: string;
    Store?: IStore;

    name: string;
    description: string;

    price: number;
    quantity: number;

    readOnly: number;

    isBulkFlower: boolean;

    productId: string;
    Product?: IProduct;

    Items?: IProductVariationItem[];
    Barcodes?: IBarcode[];

    Tags?: ITag[];

    constructor(obj: IProductVariation) {
        Object.assign(this, obj);
    }
}
