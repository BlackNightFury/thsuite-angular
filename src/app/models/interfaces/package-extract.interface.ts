import {IPackage} from "./package.interface";
import {IProduct} from "./product.interface";

export interface IPackageExtract {
    id:string;
    _package: IPackage;
    product: IProduct;
    Quantity: number;
    UnitOfMeasureName: string;
}