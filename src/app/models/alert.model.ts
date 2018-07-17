import {IAlert} from "./interfaces/alert.interface";
import * as moment from "moment";

export class Alert implements IAlert {

    id: string;
    version: number;

    title: string;
    description: string;
    url: string;
    type: string;

    createdAt: Date;

    static readonly types = {
        'transfer-not-received': 'Transfer Not Received',
        'package-wholesale-not-verified': 'Package Wholesale Not Verified',
        'set-product-price': 'Product Needs Price',
        'low-inventory': 'Low Inventory',
        'low-barcode': 'Low Barcode Count',
        'item-missing-thc-weight': 'Item Missing THC Weight'
    };

    get typeFormatted() {

        if(Alert.types[this.type]) {
            return Alert.types[this.type];
        }

        return this.type;
    }

    constructor(obj: IAlert) {
        Object.assign(this, obj);

        this.createdAt = moment.utc(obj.createdAt).toDate()
    }
}
