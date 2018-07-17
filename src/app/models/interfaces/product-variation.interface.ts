import {IBarcode} from "./barcode.interface";
import {ICommon} from "./common.interface";
import {IStore} from "./store.interface";
import {IProduct} from "./product.interface";
import {IProductVariationItem} from "./product-variation-item.interface";
import {ITag} from "./tag.interface";

export interface IProductVariation extends ICommon {

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
    Product?: IProduct

    Items?: IProductVariationItem[];
    Barcodes?: IBarcode[];

    Tags?: ITag[];
}
