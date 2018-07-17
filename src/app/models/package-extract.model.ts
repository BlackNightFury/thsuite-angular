import {IPackage} from "./interfaces/package.interface";
import {IProduct} from "./interfaces/product.interface";
import {IPackageExtract} from "./interfaces/package-extract.interface";

export class PackageExtract implements IPackageExtract {
    id:string;
    _package: IPackage;
    product: IProduct;
    Quantity: number = 0;
    UnitOfMeasureName: string;
}