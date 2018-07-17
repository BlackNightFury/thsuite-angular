import {ICommon} from "../interfaces/common.interface";
import {IProduct} from "../interfaces/product.interface";
import {IProductVariation} from "../interfaces/product-variation.interface";
import {IDiscount} from "../interfaces/discount.interface";
import {IBarcode} from "../interfaces/barcode.interface";
import {ITransaction} from "../interfaces/transaction.interface";

export interface IIncomingLineItem extends ICommon{

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
}
