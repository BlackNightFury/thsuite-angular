import {ICommon} from "./common.interface";
import {IProductType} from "./product-type.interface";
import {IPackage} from "./package.interface";
import {IStore} from "./store.interface";
import {ISupplier} from "./supplier.interface";

export interface IItem extends ICommon {

    clientId: string;

    storeId: string;
    Store?: IStore;

    MetrcId: number;
    name: string;

    UnitOfMeasureName?: string;
    UnitOfMeasureAbbreviation?: string;


    productTypeId: string;
    ProductType?: IProductType;

    Packages?: IPackage[];
    supplierId: string;
    Supplier?: ISupplier;

    thcWeight: number;
    initialPackageQuantity?: number;
}
