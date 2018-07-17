import {IReceipt} from "./interfaces/receipt.interface";
import {ITransaction} from "./interfaces/transaction.interface";
import * as moment from 'moment';
import {IStore} from "./interfaces/store.interface";
import {IUser} from "./interfaces/user.interface";
import {IPatient} from "./interfaces/patient.interface";
import {ILineItem} from "./interfaces/line-item.interface";
import {IIncomingReceipt} from "./incoming-interfaces/incoming-receipt.interface";
import {IDrawer} from "./interfaces/drawer.interface";
import {LineItem} from "./line-item.model";
import {ICaregiver} from "./interfaces/caregiver.interface";

export class Receipt implements IReceipt {
    id: string;
    version: number;

    storeId: string;
    Store?: IStore;

    barcode: string;

    LineItems?: ILineItem[];

    userId: string;
    User?: IUser;

    patientId: string;
    Patient?: IPatient;

    caregiverId?: string;
    Caregiver?: ICaregiver;

    paymentMethod: string;
    giftcardTransactionId: string;

    transactionTime: number;

    createdAt: Date;

    drawerId?: string;
    Drawer?: IDrawer;

    amountPaid: number;

    voidNotes: string;

    constructor(obj?: IIncomingReceipt) {
        Object.assign(this, obj);

        this.createdAt = this.createdAt && moment(obj.createdAt).toDate();


        if(this.LineItems) {
            this.LineItems = this.LineItems.map(lineItem => new LineItem(lineItem))
        }
    }

    get subtotal() {
        let subtotal = 0;

        for(let lineItem of this.LineItems) {
            subtotal += lineItem.isReturn !== true ? lineItem.subtotal : 0
        }

        return subtotal;
    }

    get discount() {
        let discount = 0;

        for(let lineItem of this.LineItems) {
            discount += lineItem.isReturn !== true ? lineItem.discountAmount : 0
        }

        return discount;
    }

    get refund() {
        let refund = 0;

        for(let lineItem of this.LineItems) {
            refund += lineItem.isReturn === true ? lineItem.total - lineItem.discountAmount : 0
        }

        return refund;
    }

    get tax() {
        let tax = 0;

        for(let lineItem of this.LineItems) {
            tax += lineItem.tax;
        }

        return tax;
    }

    get total() {
      return this.LineItems.reduce( (total,lineItem) => total + lineItem.total, 0 )
    }

    get taxByType(){
        let taxes = {};
        for(let lineItem of this.LineItems){
            let taxesByType = lineItem.taxByType;
            Object.keys(taxesByType).forEach(taxId => {
                if(!taxes[taxId]){
                    taxes[taxId] = taxesByType[taxId];
                }else{
                    taxes[taxId] += taxesByType[taxId];
                }
            })
        }

        return taxes;
    }

    get totalItemQuantity() {
        return this.LineItems.reduce((total, lineItem) => {
            return total + (lineItem.isReturn ? 0 : lineItem.quantity);
        }, 0);
    }

    get sentToMetrc(){
        let sent = true;
        for(let lineItem of this.LineItems){
            if(!lineItem.sentToMetrc){
                sent = false;
                break;
            }
        }

        return sent;
    }

    includesProductTypeId(productTypeId) {
        return this.LineItems.reduce( ( returnValue, lineItem ) => {
            if( lineItem.Product.productTypeId == productTypeId ) returnValue = true;
            return returnValue
        }, false )
    }
}
