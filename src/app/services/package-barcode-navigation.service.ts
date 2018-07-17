import {Router} from "@angular/router";
import {Injector, Injectable} from "@angular/core";
import {IBarcode} from "../models/interfaces/barcode.interface";
import {IPackage} from "../models/interfaces/package.interface";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {BarcodeNavigationService} from "./barcode-navigation.service";

@Injectable()
export class PackageBarcodeNavigationService implements BarcodeNavigationService {

    private router: Router;

    constructor(private injector: Injector) { //
        this.router = injector.get(Router);
    }

    createFromProductVariation(productVariation: IProductVariation, _package?: IPackage){

        let productTypeId = productVariation.Product.productTypeId;
        let productId = productVariation.Product.id;
        let productVariationId = productVariation.id;

        let queryString = `?productTypeId=${productTypeId}&productId=${productId}&productVariationId=${productVariationId}`;

        if(_package){
            queryString += `&packageId=${_package.id}`;
        }

        let url = "/admin/inventory/packages/details/" + _package.id + "/product/barcodes/add" + queryString;

        this.router.navigateByUrl(url);
    }

    createFromPackage(packageId : string, productId?:string, productTypeId?: string){
        var queryParams = {packageId : packageId};

        if(productTypeId){
            queryParams["productTypeId"] = productTypeId;

            if(productId) {
                queryParams["productId"] = productId;
            }
        }

        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'add'], {"queryParams" : queryParams});
    }

    viewPackageDetails(packageId : string){
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'details']);
    }

    viewPackageProduct(packageId : string){
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product']);
    }

    view(barcode: IBarcode, packageId : string){
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'view', barcode.id]);
    }

    edit(barcode: IBarcode, packageId : string){
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'edit', barcode.id]);
    }

    allocateInventory(barcode: IBarcode, packageId: string) {
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'view', barcode.id, 'allocate', 'add']);
    }

    viewAllocation(barcode: IBarcode, packageId: string) {
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'view', barcode.id, 'allocate', 'view']);
    }

    scaleAllocation(barcode: IBarcode, packageId: string) {
        this.router.navigate(['admin', 'inventory', 'packages', 'details', packageId, 'product', 'barcodes', 'view', barcode.id, 'allocate', 'scale']);
    }
}