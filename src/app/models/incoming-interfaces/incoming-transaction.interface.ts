import {ICommon} from "../interfaces/common.interface";
import {IDiscount} from "../interfaces/discount.interface";
import {IProductVariation} from "../interfaces/product-variation.interface";
import {IProduct} from "../interfaces/product.interface";
import {IPackage} from "../interfaces/package.interface";
import {IStore} from "../interfaces/store.interface";
import {IItem} from "../interfaces/item.interface";
import {ITransactionTax} from "../interfaces/transaction-tax.interface";
export interface IIncomingTransaction extends ICommon{
    storeId: string;
    Store?: IStore;

    receiptId: string;
    // Receipt?: IReceipt; circular dependency

    lineItemId: string;
    // LineItem?: ILineItem; circular dependency

    packageId: string;
    Package?: IPackage;

    productId: string;
    Product?: IProduct;

    productVariationId: string;
    ProductVariation?: IProductVariation;

    itemId: string;
    Item?: IItem;

    barcodeProductVariationItemPackageId?: string;
    // Barcode?: IBarcode; TODO needs model

    TransactionTaxes?: ITransactionTax[];

    QuantitySold: number;
    TotalPrice: number;

    discountId?: string;
    Discount?: IDiscount;
    discountAmount?: number;
    isReturn: boolean;
    returnedQuantity: number;
    wasReturned: boolean;

    transactionDate?: Date;

    sentToMetrc: boolean;

    originalTransactionId?: string;
    originalTransactionTotalPrice?: number;
    originalTransactionQuantitySold?: number;
    originalTransactionReturnedQuantity?: number;
}
