import {IDiscount} from "./interfaces/discount.interface";
import * as moment from "moment";

export class Discount implements IDiscount {
    id: string;
    version: number;

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

    productTypeId: string;
    productId: string;
    packageId: string;
    productVariationId: string;
    lineItemId: string;
    supplierId: string;

    isActive: boolean;
    isAutomatic: boolean;
    isCustom: boolean;
    isOverride: boolean;
    managerApproval: boolean;

    thcType: string;
    notes: string;

    constructor(obj: IDiscount) {
        Object.assign(this, obj);

        if(this.startDate && typeof obj.startDate == 'string') {
            this.startDate = this.startDate && moment((<any>obj.startDate).substr(0, 10)).toDate();
        }

        if(this.endDate && typeof obj.endDate == 'string') {
            this.endDate = this.endDate && moment((<any>obj.endDate).substr(0, 10)).toDate();
        }

        this.startTime = this.startTime && moment.utc(obj.startTime, 'HH:mm:ss').local().toDate();
        this.endTime = this.endTime && moment.utc(obj.endTime, 'HH:mm:ss').local().toDate();
    }
}
