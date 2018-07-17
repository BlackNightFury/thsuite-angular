import {ICommon} from "./common.interface";
import {IProductVariation} from "./product-variation.interface";
import {IPackage} from "./package.interface";
import {IItem} from "./item.interface";

export interface IBarcode extends ICommon{

    barcode: string;
    productVariationId: string;
    allocatedInventory: number;
    remainingInventory: number;
    createdAt: string;
    ProductVariation?: IProductVariation;
    Items?: IItem[];
    Packages?: IPackage[];
    ItemPackages?: any[];

    // Virtual field
    barcodeTemporaryCopy?: string;
}