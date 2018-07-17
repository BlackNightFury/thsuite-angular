import {IReceipt} from "./interfaces/receipt.interface";
import {ITransaction} from "./interfaces/transaction.interface";
import * as moment from 'moment';
import {IStore} from "./interfaces/store.interface";
import {IUser} from "./interfaces/user.interface";
import {IPatient} from "./interfaces/patient.interface";
import {ILineItem} from "./interfaces/line-item.interface";
import {IBarcode} from "./interfaces/barcode.interface";
import {IDiscount} from "./interfaces/discount.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IProduct} from "./interfaces/product.interface";
import {IIncomingLineItem} from "./incoming-interfaces/incoming-line-item.interface";
import {Transaction} from "./transaction.model";

export class LineItem implements ILineItem {
    id: string;
    version: number;

    storeId: string;

    receiptId: string;
    // Receipt?: IReceipt; circular dependency

    productId: string;
    Product?: IProduct;

    productVariationId: string;
    ProductVariation?: IProductVariation;

    discountId: string;
    Discount?: IDiscount;

    barcodeId?: string;
    Barcode?: IBarcode;

    discountAmount: number;

    quantity: number;
    price: number;

    Transactions: ITransaction[];

    isReturning?: boolean;

    unitPrice?: number;

    skipDiscountInPOSCart?: any[];

    fromSavedCart?: boolean;

    constructor(obj?: IIncomingLineItem) {
        delete obj['returnedQuantity']
        delete obj['isReturn']
        delete obj['wasReturned']
        Object.assign(this, obj);

        if(this.Transactions) {
            this.Transactions = this.Transactions.map(transaction => new Transaction(transaction));
        }
    }

    get fromBarcode() {
        return !!this.barcodeId;
    }

    get subtotal() {
        let subtotal = 0;

        for(let transaction of this.Transactions) {
            subtotal += transaction.subtotal;
        }

        return subtotal;
    }

    get discount() {
        let discount = 0;

        for(let transaction of this.Transactions) {
            discount += ( transaction.discountAmount || 0 )
        }

        return discount;
    }

    get tax() {
        let tax = 0;

        for(let transaction of this.Transactions) {
            tax += transaction.tax;
        }

        return tax;
    }

    get total() {
        let total = 0;

        for(let transaction of this.Transactions) {
            total += transaction.TotalPrice;
        }

        return total;
    }

    get taxByType(){
        let taxes = {};
        for(let transaction of this.Transactions){
            let taxesByType = transaction.taxByType;
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

    get canReturn() {
        const isReturn = this.isReturn,
            wasAlreadyReturned = this.Transactions.reduce( ( result, transaction ) => { if( !transaction.wasReturned || transaction.returnedQuantity < transaction.QuantitySold ) { result = false } return result; }, true )

        if( this.isReturn || wasAlreadyReturned ) return false

        return true
    }

    get isReturn() {
        return this.Transactions.reduce( ( result, transaction ) => { if( transaction.isReturn ) { result = true } return result; }, false )
    }

    get returnedQuantity() {
        return this.Transactions.reduce( ( returnedQuantity, transaction ) => returnedQuantity + ( transaction.isReturn || !transaction.returnedQuantity ? 0 : ( transaction.returnedQuantity / this.ProductVariation.quantity ) ), 0 )
    }

    get wasReturned() {
        return this.Transactions.reduce( ( result, transaction ) => { if( transaction.wasReturned ) { result = true } return result; }, false )
    }

    get originalPurchaseQuantity() {
        return this.Transactions.reduce( ( originalPurchaseQuantity, transaction ) => originalPurchaseQuantity + ( transaction.isReturn ? ( transaction.originalTransactionQuantitySold / this.ProductVariation.quantity ) : 0 ), 0 )
    }

    get originalPurchaseReturnedQuantity() {
        return this.Transactions.reduce( ( originalPurchaseReturnedQuantity, transaction ) => originalPurchaseReturnedQuantity + ( transaction.isReturn ? 0 : ( transaction.originalTransactionReturnedQuantity / this.ProductVariation.quantity ) ), 0 )
    }

    get sentToMetrc(){
        let sent = true;
        for(let transaction of this.Transactions){
            if(!transaction.sentToMetrc){
                sent = false;
                break;
            }
        }
        return sent;
    }

    get wholesalePrice() {

        let wholesalePrice = 0;

        for(let transaction of this.Transactions) {
            if(!transaction.Package) {
                return 0;
            }

            let unitWholesalePrice = (transaction.Package.wholesalePrice || 0) / transaction.Package.ReceivedQuantity;
            let unitsSold = this.quantity * this.ProductVariation.quantity;

            wholesalePrice += unitsSold * unitWholesalePrice;
        }

        return wholesalePrice;
    }

    get allTransactionsHavePackages() {
        for(let transaction of this.Transactions) {
            if(!transaction.Package) {
                return false;
            }
        }

        return true;
    }
}
