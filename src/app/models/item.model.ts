import {IProductType} from "./interfaces/product-type.interface";
import {IPackage} from "./interfaces/package.interface";
import {IStore} from "./interfaces/store.interface";
import {IItem} from "./interfaces/item.interface";
import {ISupplier} from "./interfaces/supplier.interface";

export class Item implements IItem {
    id: string;
    version: number;

    clientId: string;

    storeId: string;
    Store?: IStore;

    MetrcId: number;
    name: string;

    UnitOfMeasureName: string;
    UnitOfMeasureAbbreviation: string;

    productTypeId: string;
    ProductType?: IProductType;

    Packages?: IPackage[];

    supplierId: string;
    Supplier?: ISupplier;
    
    thcWeight: number;

    initialPackageQuantity?: number;

    get totalQuantity() {

        if(!this.Packages) {
            return 0;
        }

        let quantity = 0;
        for(let _package of this.Packages) {
            //TODO handle different units of measure

            quantity += _package.Quantity;
        }

        return quantity;
    }

    get isLow() {
        const hasGramThreshold = this.Store && this.Store.settings && this.Store.settings.lowInventoryGramThreshold,
            hasEachThreshold = this.Store && this.Store.settings && this.Store.settings.lowInventoryEachThreshold
        
        if(this.totalQuantity <= 0 || (!hasGramThreshold && !hasEachThreshold)) return false

        return this.UnitOfMeasureName === 'Grams'
            ? Boolean(this.totalQuantity < this.Store.settings.lowInventoryGramThreshold || 0)
            : this.UnitOfMeasureName === 'Each'
                ? Boolean(this.totalQuantity < this.Store.settings.lowInventoryEachThreshold || 0)
                : false
    }

    constructor(obj: IItem) {
        Object.assign(this, obj);
    }
}
