import {Injectable, Injector} from "@angular/core";
import * as uuid from "uuid";
import {IPackage} from "../models/interfaces/package.interface";
import {IPackageExtract} from "../models/interfaces/package-extract.interface";
import {IPackageConversion} from "../models/interfaces/package-conversion.interface";
import {Package} from "../models/package.model";
import {PackageService} from "../services/package.service";
import {PackageExtract} from "../models/package-extract.model";
import {PackageConversion} from "../models/package-conversion.model";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ProductService} from "./product.service";

declare const $: any;

@Injectable()
export class PackageConversionService {

    protected emitConfirmModalShowingSource = new BehaviorSubject<boolean>(undefined);
    confirmModalShowing = this.emitConfirmModalShowingSource.asObservable();

    constructor(private packageService: PackageService, private productService: ProductService) {
    }

    public addInPackageExtract(packageConversion:IPackageConversion, _package:IPackage, quantity?:number) {

        if(_package && _package.id) {
            if(this.hasInPackageWithPackageId(packageConversion, _package.id)) throw Error("Adding duplicate package.");
        }

        var packageExtract = new PackageExtract();
        packageExtract.id = uuid.v4();
        packageExtract._package = _package;

        packageExtract.Quantity = quantity ? quantity : 0;

        packageConversion.inPackageExtracts.push(packageExtract);

        this.setInPackageProduct(packageExtract);
    }

    public setInPackageProduct(packageExtract) {
        if(packageExtract._package && packageExtract._package.id){
            this.productService.getByPackageId(packageExtract._package.id).take(1).subscribe((productObservable) => {
                productObservable.subscribe((product) => {
                    packageExtract.product = product;
                });
            });
        }
    }

    public removeInPackageExtractById(packageConversion:IPackageConversion, id:string) {

        var i=0;
        while(i<packageConversion.inPackageExtracts.length){
            if(packageConversion.inPackageExtracts[i].id == id){
                packageConversion.inPackageExtracts.splice(i,1);
            } else {
                i++;
            }
        }
    }

    public hasInPackageWithPackageId(packageConversion:IPackageConversion, id:string):boolean {
        for(let packageExtract of packageConversion.inPackageExtracts) {
            if(packageExtract._package.id == id) {
                return true;
            }
        }

        return false;
    }

    getTotalInQuantity(packageConversion){
        var totalQuantity = 0;

        for(let inPackageExtract of packageConversion.inPackageExtracts){
            totalQuantity += inPackageExtract.Quantity;
        }

        return totalQuantity;
    }

    submitPackageConversion(packageConversion:IPackageConversion){
        return new Promise<any>((resolve,reject) => {
            //TODO : try to submit
            console.log('TRYING TO SUBMIT PACKAGE');
            console.log(packageConversion);

            this.packageService.convertToAnotherPackage({
                packages: packageConversion.inPackageExtracts.map(p => ({ packageId: p._package.id, quantity: p.Quantity })),
                outDate: packageConversion.outDate,
                outItemId: packageConversion.outItemId,
                outPackageLabeId: packageConversion.outPackageLabel,
                outSupplierId: packageConversion.outSupplierId
            }).then(response => {
                console.log('Package convert', response)
                resolve(response);
            }).catch(err => {
                console.error(err);
                reject(err);
            })
        })
    }
}
