import {IPackage} from "./interfaces/package.interface";
import {IPackageExtract} from "./interfaces/package-extract.interface";
import {IPackageConversion} from "./interfaces/package-conversion.interface";

export class PackageConversion implements IPackageConversion {
    inPackageExtracts:Array<IPackageExtract>;

    outPackageLabel:string;
    outItemId:string;
    outDate:Date;
    outSupplierId:string;

    constructor(){
        this.inPackageExtracts = new Array<IPackageExtract>();
    }
}