import {IBarcode} from "../models/interfaces/barcode.interface";
import {IPackage} from "../models/interfaces/package.interface";
import {IProductVariation} from "../models/interfaces/product-variation.interface";

export interface BarcodeNavigationService  {

    createFromProductVariation(productVariation: IProductVariation, _package?: IPackage);

    view(barcode: IBarcode, packageId: string);

    edit(barcode: IBarcode, packageId: string);

    allocateInventory(barcode: IBarcode, packageId: string);

    viewAllocation(barcode: IBarcode, packageId: string);

    scaleAllocation(barcode: IBarcode, packageId: string);
}
