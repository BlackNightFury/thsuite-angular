import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ITransaction} from "../models/interfaces/transaction.interface";
import {Transaction} from "../models/transaction.model";
import {Router} from "@angular/router";
import {DateRange} from "../lib/date-range";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {TransactionService} from "./transaction.service";
import {Receipt} from "../models/receipt.model";
import {ObjectObservable} from "app/lib/object-observable";
import {UserService} from "./user.service";
import {BarcodeService} from "./barcode.service";
import {ILineItem} from "../models/interfaces/line-item.interface";
import {LineItem} from "../models/line-item.model";
import {ProductVariationService} from "./product-variation.service";
import {ProductService} from "./product.service";
import {DiscountService} from "./discount.service";
import {ObjectSubject} from "../lib/object-subject";


@Injectable()
export class LineItemService extends CommonService<ILineItem> {

    constructor(
        injector: Injector,
        private transactionService: TransactionService,
        private barcodeService: BarcodeService,
        private productService: ProductService,
        private productVariationService: ProductVariationService,
        private discountService: DiscountService
    ) {
        super(injector, 'line-items');
    }

    newInstance(): ILineItem {
        // throw new Error("LineItem object cannot be created on frontend");
        return new LineItem({
            id: uuid.v4(),
            version: 0,

            storeId: '',
            receiptId: '',
            productId: '',
            productVariationId: '',
            discountId: '',
            barcodeId: '',
            discountAmount: 0,
            quantity: 0,
            price: 0,
            Transactions: []
        });
    }
    dbInstance(fromDb: ILineItem) {
        return new LineItem(fromDb);
    }

    instanceForSocket(object: ILineItem) {
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,
            receiptId: object.receiptId,
            productId: object.productId,
            productVariationId: object.productVariationId,
            discountId: object.discountId,
            barcodeId: object.barcodeId,
            discountAmount: object.discountAmount,
            quantity: object.quantity,
            price: object.price,

            //Note: These are dummy values --
            //if you are here because receipts are saving incorrectly, look elsewhere -- receipts from transactions don't get passed through here
            Transactions: [],
            fromBarcode: false,
            subtotal: 0,
            discount: 0,
            refund: 0,
            tax: 0,
            total: 0,
            taxByType: null,
            canReturn: false,
            isReturn: false,
            wasReturned: false,
            returnedQuantity: 0,
            originalPurchaseQuantity: 0,
            originalPurchaseReturnedQuantity: 0,
            sentToMetrc: false,

            wholesalePrice: 0,
            allTransactionsHavePackages: false
        }
    }
/*
    get(id: string): ObjectObservable<ILineItem> {

        let [subject, created] = this.getSubject(id);

        this.socket.emitPromise('get', id)
            .then(response => {
                subject.next(this.dbInstance(response));
                // subject.next(response);
            });

        return subject.asObservable();
    }

    getAssociated(id: string, scopes?: Array<string>): ObjectObservable<ILineItem> {

        const key = scopes && scopes.length ? `${id}.${scopes.join('-')}` : id;

        const existing = this.get(key);

        let existingAssociated = new ObjectSubject(key);
        this.associatedObjectMap.set(key, existingAssociated);

        existing
            .switchMap(obj => this.resolveAssociations.apply(this, [obj, scopes]))
            .subscribe(existingAssociated);


        return existingAssociated.asObservable();
    }
*/

    getByReceiptId(receiptId: string): Observable<ILineItem[]> {

        let results = new Subject<ILineItem[]>();

        this.socket.emitPromise('getByReceiptId', receiptId)
            .then(transactionIds => {

                if(transactionIds.length) {
                    Observable.combineLatest(transactionIds.map(id => this.getAssociated(id)))
                        .subscribe(results);
                }
                else {
                    results.next([]);
                }
            });

        return results.asObservable()
    }

    resolveAssociations(lineItem: ILineItem, scopes: Array<string> = ['transactions', 'barcode', 'product', 'productVariation', 'discount']): ObjectObservable<ILineItem> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'transactions': {
                // Key in parent Object => resolver function that must return observable
                'Transactions': () => this.transactionService.getByLineItemId(lineItem.id)
            },
            'barcode': {
                'Barcode': () => lineItem.fromBarcode ? this.barcodeService.get(lineItem.barcodeId) : Observable.of(undefined)
            },
            'product': {
                'Product': () => lineItem.productId ? this.productService.getAssociated(lineItem.productId) : Observable.of(undefined)
            },
            'productVariation': {
                'ProductVariation': () => lineItem.productVariationId ? this.productVariationService.getAssociated(lineItem.productVariationId) : Observable.of(undefined)
            },
            'discount': {
                'Discount': () => lineItem.discountId ? this.discountService.get(lineItem.discountId) : Observable.of(undefined)
            },
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(lineItem), lineItem.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(lineItem, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, lineItem.id);
    }

    resolveAssociationsLegacy(lineItem: ILineItem): ObjectObservable<ILineItem> {

        let obs = Observable.combineLatest(
            this.transactionService.getByLineItemId(lineItem.id),
            this.productService.getAssociated(lineItem.productId),
            this.productVariationService.getAssociated(lineItem.productVariationId),
            lineItem.fromBarcode ? this.barcodeService.get(lineItem.barcodeId) : Observable.of(undefined),
            lineItem.discountId ? this.discountService.get(lineItem.discountId) : Observable.of(undefined)
        ).map(([transactions, product, productVariation, barcode, discount]) => {
            lineItem.Transactions = transactions;
            lineItem.Barcode = barcode;
            lineItem.Product = product;
            lineItem.ProductVariation = productVariation;
            lineItem.Discount = discount;
            return lineItem;
        });

        return new ObjectObservable(obs, lineItem.id);
    }

    async remove(lineItem: ILineItem) {
        await Promise.all( lineItem.Transactions.map( async transaction => {return this.transactionService.remove(transaction) } ) )

        return this.socket.emitPromise('void', lineItem.id )
    }
}
