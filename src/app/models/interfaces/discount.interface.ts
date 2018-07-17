import {ICommon} from "./common.interface";
import {IProductType} from "./product-type.interface";
import {IProduct} from "./product.interface";
import {IPackage} from "./package.interface";
import {IPatientGroup} from "./patient-group.interface";
import {ILineItem} from "./line-item.interface";
import {ISupplier} from "./supplier.interface";

export interface IDiscount extends ICommon {

    name: string;
    code: string;

    amountType: string;
    amount: number;

    minimumType: string;
    minimum: number;

    maximum: number;

    startDate: Date;
    endDate: Date;

    startTime: Date;
    endTime: Date;


    days: string[];

    patientType: string;
    patientGroupId: string;
    PatientGroup?: IPatientGroup;

    productTypeId: string;
    ProductType?: IProductType;

    productId: string;
    Product?: IProduct;

    packageId: string;
    Package?: IPackage;

    lineItemId: string;
    LineItem? : ILineItem;

    supplierId: string;
    Supplier? : ISupplier;

    productVariationId: string;

    isActive: boolean;
    isAutomatic: boolean;
    isCustom: boolean;
    isOverride: boolean;
    managerApproval: boolean;

    thcType: string;
    notes: string;
}
