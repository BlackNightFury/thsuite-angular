import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import * as moment from "moment";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ITransaction} from "../models/interfaces/transaction.interface";
import {Transaction} from "../models/transaction.model";
import {Router} from "@angular/router";
import {DateRange} from "../lib/date-range";
import {ObjectObservable} from "../lib/object-observable";
import {PackageService} from "./package.service";
import {ProductService} from "./product.service";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {ProductVariationService} from "./product-variation.service";
import {BarcodeService} from "./barcode.service";
import {ItemService} from "./item.service";
import {DiscountService} from "./discount.service";
import {TransactionTaxService} from "./transaction-tax.service";
import {ITransactionTax} from "../models/interfaces/transaction-tax.interface";
import {ObjectSubject} from "../lib/object-subject";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

@Injectable()
export class TransactionService extends CommonService<ITransaction> {

    private transaction = new Subject<Observable<ITransaction>[]>();

    constructor(
        injector: Injector,
        private packageService: PackageService,
        private productService: ProductService,
        private productVariationService: ProductVariationService,
        private itemService: ItemService,
        private transactionTaxService: TransactionTaxService,
        private discountService: DiscountService
    ) {
        super(injector, 'transactions');
    }

    insert(transactions: ITransaction[], discountAmount: number) {
        return this.socket.emitPromise('create', {transactions, discountAmount})
    }

    protected getSubject(id: string): [ObjectSubject<Transaction>, boolean] {

        if(!id) {
            console.error(new Error("Got empty id to getSubject:'" + id + "'"));
        }

        let existingSubject = new ObjectSubject(id);
        this.objectMap.set(id, existingSubject);

        existingSubject.subscribe(this.upsertToZango.bind(this));

        return [existingSubject, true];
    }

    getAssociated(id: string, scopes?: Array<string>): ObjectObservable<ITransaction> {
        const key = scopes && scopes.length ? `${id}.${scopes.join('-')}` : id;
        const existing = this.get(key);

        const existingAssociated = new ObjectSubject(key);
        this.associatedObjectMap.set(key, existingAssociated);

        existing
            // Due to the nature of javascript, 2nd argument `scopes` will be ignored for those services who doesn't support it now.
            // For the same reason it's not possible to call resolveAssociations() directly anymore, because Typescript complains about arguments mismatch.
            .switchMap(obj => this.resolveAssociations.apply(this, [obj, scopes]))
            .subscribe(existingAssociated);

        return existingAssociated.asObservable();
    }

    getByLineItemId(lineItemId: string): Observable<ITransaction[]> {

        let results = new Subject<ITransaction[]>();

        this.socket.emitPromise('getByLineItemId', lineItemId)
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

    newInstance() {
        return new Transaction({
            id: uuid.v4(),
            version: 0,

            storeId: '',

            receiptId: '',
            lineItemId: '',

            packageId: '',

            productId: '',

            productVariationId: '',

            itemId: '',

            QuantitySold: 0,
            TotalPrice: 0,

            isReturn: false,
            returnedQuantity: 0,
            wasReturned: false,

            sentToMetrc: false,
            discountAmount: 0
        });
    }
    dbInstance(fromDb: ITransaction) {
        return new Transaction(fromDb);
    }

    instanceForSocket(object: ITransaction): ITransaction{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,

            receiptId: object.receiptId,

            lineItemId: object.lineItemId,

            packageId: object.packageId,

            productId: object.productId,
            productVariationId: object.productVariationId,

            itemId: object.itemId,

            QuantitySold: object.QuantitySold,
            TotalPrice: object.TotalPrice,

            discountId: object.discountId,
            discountAmount: object.discountAmount,

            isReturn: object.isReturn,
            returnedQuantity: object.returnedQuantity,
            wasReturned: object.wasReturned,
            transactionDate: object.transactionDate,

            sentToMetrc: object.sentToMetrc,

            //Note: These are dummy values --
            //if you are here because receipts are saving incorrectly, look elsewhere -- receipts from transactions don't get passed through here
            subtotal: 0,
            tax: 0,
            taxByType: null
        };
    }

    submitToMetrc() {
        return this.socket.emitPromise('send-to-metrc').then(response => {
            return response ? "Transactions submitted to Metrc" : "Transaction sync is already in progress";
        })
    }

    resolveAssociations(transaction: ITransaction, scopes: Array<string> = ['package', 'product', 'productVariation', 'item', 'transactionTaxes', 'discount']): ObjectObservable<ITransaction> {

        // Define the rules how associations are resolved
        const scopeResolvers = {
            'package': {
                // Key in parent Object => resolver function that must return observable
                'Package': () => this.packageService.getAssociated(transaction.packageId)
            },
            'product': {
                'Product': () => this.productService.getAssociated(transaction.productId)
            },
            'productVariation': {
                'ProductVariation': () => this.productVariationService.getAssociated(transaction.productVariationId)
            },
            'item': {
                'Item': () => this.itemService.getAssociated(transaction.itemId)
            },
            'transactionTaxes': {
                'TransactionTaxes': () => this.transactionTaxService.getByTransactionId(transaction.id)
            },
            'discount': {
                'Discount': () => transaction.discountId ? this.discountService.get(transaction.discountId) : Observable.of(undefined)
            },
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(transaction), transaction.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);

                if (!vars['discount']) {
                    delete vars['discount'];
                }

                if (!vars['transactionTaxes'] || !vars['transactionTaxes'].length) {
                    return Observable.of(this.mapAssociationsObject(transaction, vars, resolversToResolve));
                } else {
                    return Observable.combineLatest(vars['transactionTaxes'], (...transactionTaxes: ITransactionTax[]) => {
                        vars['transactionTaxes'] = transactionTaxes;
                        return this.mapAssociationsObject(transaction, vars, resolversToResolve);
                    });
                }
            });

        return new ObjectObservable(obs, transaction.id);
    }

    resolveAssociationsLegacy(transaction: ITransaction): ObjectObservable<ITransaction> {

        let obs = Observable.combineLatest(
            this.packageService.getAssociated(transaction.packageId),
            this.productService.getAssociated(transaction.productId),
            this.productVariationService.getAssociated(transaction.productVariationId),
            this.itemService.getAssociated(transaction.itemId),
            this.transactionTaxService.getByTransactionId(transaction.id),
            transaction.discountId ? this.discountService.get(transaction.discountId) : Observable.of(undefined)
        ).switchMap(([_package, product, productVariation, item, transactionTaxObservables, discount]) => {

            if(!transactionTaxObservables.length){
                transaction.Package = _package;
                transaction.Product = product;
                transaction.ProductVariation = productVariation;
                transaction.Item = item;
                transaction.TransactionTaxes = [];
                if(discount) transaction.Discount = discount

                return Observable.of(transaction)
            }

            return Observable.combineLatest(transactionTaxObservables, (...transactionTaxes: ITransactionTax[]) => {
                transaction.Package = _package;
                transaction.Product = product;
                transaction.ProductVariation = productVariation;
                transaction.Item = item;

                transaction.TransactionTaxes = transactionTaxes;

                if(discount) transaction.Discount = discount

                return transaction;
            })

        });

        return new ObjectObservable(obs, transaction.id);

    }

    /**
     *
     * @returns {Observable<Observable<ITransaction>[]>}
     */
    getReportData(dateRange: Observable<DateRange>, loadingBarService?: SlimLoadingBarService): Observable<Observable<ITransaction>[]> {

        return dateRange
            .switchMap(dateRange => {
                if(loadingBarService){
                    loadingBarService.start();
                }

                return this.socket.emitPromise('get-sales-data', {
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                })
                .catch(err => {
                        console.log('err: ');
                        console.log(err);
                        
                        if(loadingBarService){
                            loadingBarService.complete();
                        }
                    });
        });

    }

    exportDayTransactions(args) {
        return this.socket.emitPromise('download-day-transactions', args )
            .then(response => {
                return response.Location;
            }).catch(err => {
            console.log('Error exporting day transactions: ');
            console.log(err);
        });
    }

    downloadReport(args){
        return this.socket.emitPromise('download-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
            console.log('err: ');
            console.log(err);
        });
    }

    getEmployeeSalesData(dateRange: Observable<DateRange>): Observable<any> {
        return dateRange
            .switchMap(dateRange => {
                return this.socket.emitPromise('get-employee-sales-data', {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            });
    }

    getDailySales(args): Promise<any> {

        return this.socket.emitPromise('get-daily-sales', args);

    }

    getPeakSales(terms: any): Observable<Observable<Array<any>[]>>{
        let data = new Subject<Observable<Array<any>[]>>();
        this.socket.emitPromise('get-peak-sales', terms)
            .then(response => {
                data.next(response);
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });

        return data.asObservable();
    }

    getSalesOverTime(dateRange: Observable<DateRange>, granularity: Observable<string>): Observable<Observable<any>[]>{

        return Observable.combineLatest(dateRange, granularity)
            .switchMap(([dateRange, granularity]) => {
                return this.socket.emitPromise('get-sales-over-time', {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    granularity: granularity
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    })
            });

    }

    salesBreakdownReport(dates: any): Promise<any[]> {
        return this.socket.emitPromise('sales-breakdown-report', dates)
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }

    async remove(transaction: ITransaction ) {
        await Promise.all( transaction.TransactionTaxes.map( async transactionTax => {return this.transactionTaxService.remove(transactionTax) } ) )

        return this.socket.emitPromise( 'void', transaction.id )
    }
}
