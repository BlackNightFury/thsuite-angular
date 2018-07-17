import {LineItem} from "./line-item.model";
import {IPackage} from "./interfaces/package.interface";
import {IItem} from "./interfaces/item.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IDiscount} from "./interfaces/discount.interface";
import {IPatient} from "./interfaces/patient.interface";

export class Cart {
    public lineItems: LineItem[] = [];

    public owner: IPatient; //TODO: Change this to refer to the patient/customer this cart is for -- or some other way to identify the cart

    public taxesIncluded: boolean = true;

    public timerSeconds: number = 0;

    get discountAmount() {
        return this.lineItems.reduce( (total,lineItem) => total + lineItem.discount, 0 )
    }

    get hasReturns() {
        let hasReturns = false

        this.lineItems.forEach((lineItem) => {
            if(lineItem.isReturn === true) hasReturns = true
        })

        return hasReturns
    }

    get returnAmount() {
        return Math.abs(
            this.lineItems.reduce( (curAmount,lineItem) => curAmount + ( lineItem.isReturn === true ? lineItem.total : 0 ), 0 )
        )
    }

    get subtotal() {

        const price = this.lineItems.filter(lineItem => !lineItem.isReturn).reduce((sum,lineItem) => sum + lineItem.subtotal, 0 )

        if(this.taxesIncluded) {
            return price - this.tax;
        }else{
            return price;
        }
    }

    public tax: number = 0;

    get total() {
        return this.subtotal + this.tax;
    }
}
