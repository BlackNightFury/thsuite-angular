import {IPackage} from "./package.interface";
import {IPackageExtract} from "./package-extract.interface";

export interface IPackageConversion {
    inPackageExtracts:Array<IPackageExtract>;
    outPackageLabel:string;
    outItemId:string;
    outDate:Date;
    outSupplierId:string;
}