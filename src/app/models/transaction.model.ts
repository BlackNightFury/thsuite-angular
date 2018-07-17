import {ITransaction} from "./interfaces/transaction.interface";
import {IBarcode} from "./interfaces/barcode.interface";
import {IProductVariation} from "./interfaces/product-variation.interface";
import {IProduct} from "./interfaces/product.interface";
import {IPackage} from "./interfaces/package.interface";
import {IReceipt} from "./interfaces/receipt.interface";
import {IStore} from "./interfaces/store.interface";
import {IDiscount} from "./interfaces/discount.interface";
import * as moment from  'moment';
import {IIncomingTransaction} from "./incoming-interfaces/incoming-transaction.interface";
import {IItem} from "./interfaces/item.interface";
import {ITransactionTax} from "./interfaces/transaction-tax.interface";

export class Transaction implements ITransaction {
    id: string;
    version: number;

    storeId: string;
    Store?: IStore;

    receiptId: string;
    // Receipt?: IReceipt;

    lineItemId: string;
    // LineItem?: ILineItem;

    packageId: string;
    Package?: IPackage;

    productId: string;
    Product?: IProduct;

    productVariationId: string;
    ProductVariation: IProductVariation;

    itemId: string;
    Item?: IItem;

    barcodeProductVariationItemPackageId?: string;
    // Barcode?: IBarcode;

    TransactionTaxes?: ITransactionTax[];

    QuantitySold: number;
    TotalPrice: number;

    discountId?: string;
    Discount?: IDiscount;
    discountAmount?: number;
    isReturn: boolean;
    returnedQuantity: number;
    wasReturned: boolean;

    originalTransactionId?: string;
    originalTransactionTotalPrice?: number;
    originalTransactionQuantitySold?: number;
    originalTransactionReturnedQuantity?: number;

    transactionDate?: Date;

    sentToMetrc: boolean;

    packageSelect2Options?: Select2Options;

    constructor(obj?: IIncomingTransaction) {

        this.id = obj.id;
        this.version = obj.version;

        this.storeId = obj.storeId;
        this.Store = obj.Store;

        this.receiptId = obj.receiptId;

        this.lineItemId = obj.lineItemId;

        this.packageId = obj.packageId;
        this.Package = obj.Package;

        this.productId = obj.productId;
        this.Product = obj.Product;

        this.productVariationId = obj.productVariationId;
        this.ProductVariation = obj.ProductVariation;

        this.itemId = obj.itemId;
        this.Item = obj.Item;

        this.barcodeProductVariationItemPackageId = obj.barcodeProductVariationItemPackageId;

        this.TransactionTaxes = obj.TransactionTaxes;

        this.QuantitySold = obj.QuantitySold;
        this.TotalPrice = obj.TotalPrice;

        this.discountId = obj.discountId;
        this.Discount = obj.Discount;
        this.discountAmount = obj.discountAmount;

        this.transactionDate = this.transactionDate && moment.utc(obj.transactionDate).toDate();

        this.sentToMetrc = obj.sentToMetrc;
       
        Object.assign( this, { 
            isReturn: obj.isReturn,
            returnedQuantity: obj.returnedQuantity,
            wasReturned: obj.wasReturned,
            originalTransactionId: obj.originalTransactionId,
            originalTransactionTotalPrice: obj.originalTransactionTotalPrice,
            originalTransactionQuantitySold: obj.originalTransactionQuantitySold,
            originalTransactionReturnedQuantity: obj.originalTransactionReturnedQuantity
        } )

    }

    get subtotal() {
        return this.TotalPrice + ( this.discountAmount || 0 );
    }

    get tax() {
        //total = subtotal + subtotal * 0.08
        //total = subtotal * 1.08
        //subtotal = total / 1.08
        //tax = subtotal * 0.08 = total * 0.08 / 1.08
        // return this.TotalPrice * 0.08 / 1.08;
        let tax = 0;
        this.TransactionTaxes.forEach(transactionTax => {
            tax += transactionTax.amount;
        });

        return tax;
    }

    get taxByType(){
        let taxes = {};
        for(let tax of this.TransactionTaxes){
            taxes[tax.taxId] = tax.amount;
        }

        return taxes;
    }
}
