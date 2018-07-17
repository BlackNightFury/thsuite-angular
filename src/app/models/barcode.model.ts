import {IBarcode} from "./interfaces/barcode.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IPackage} from "./interfaces/package.interface";
import {IItem} from "./interfaces/item.interface";

export class Barcode implements IBarcode{

    id: string;
    version: number;

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

    constructor(obj: IBarcode) {
        Object.assign(this, obj);
    }
}
