import {ICommon} from "./common.interface";

export interface IProductType extends ICommon {

    category: string;
    cannabisCategory: string;
    name: string;
    unitOfMeasure: string;
    notes: string;

}
