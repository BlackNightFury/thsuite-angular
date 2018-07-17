import {IProductType} from "./interfaces/product-type.interface";
export class ProductType implements IProductType {
    id: string;
    version: number;

    category: string;
    cannabisCategory: string;
    name: string;
    unitOfMeasure: string;
    notes: string;


    constructor(obj: IProductType) {
        Object.assign(this, obj);
    }


}
