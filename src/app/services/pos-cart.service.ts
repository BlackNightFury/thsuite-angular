import {Injectable, Injector} from "@angular/core";
import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {IPackage} from "../models/interfaces/package.interface";
import {PackageService} from "./package.service";
import {TransactionService} from "./transaction.service";
import {IDiscount} from "../models/interfaces/discount.interface";
import {Discount} from "../models/discount.model";
import {Customer} from "../models/customer.model";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {IItem} from "../models/interfaces/item.interface";
import {Router} from "@angular/router";
import {ReceiptService} from "./receipt.service";
import {IUser} from "../models/interfaces/user.interface";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {TaxService} from "app/services/tax.service";
import {Observable} from "rxjs/Observable";
import {ITax} from "app/models/interfaces/tax.interface";
import {StoreService} from "./store.service";
import {IStore} from "../models/interfaces/store.interface";
import {LineItem} from "../models/line-item.model";
import {ILineItem} from "../models/interfaces/line-item.interface";
import {IDrawer} from "../models/interfaces/drawer.interface";
import {Transaction} from "../models/transaction.model";
import {TransactionTaxService} from "./transaction-tax.service";
import * as moment from 'moment';
import {LineItemService} from "./line-item.service";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Cart} from "../models/cart.model";
import {DrawerService} from "./drawer.service";
import {PrinterService} from "./printer.service";
import {ProductVariationService} from "./product-variation.service";
import {ITransaction} from "../models/interfaces/transaction.interface";
import {PatientCartWithStart} from "app/pos/pos-patient-queue/patient-cart-with-start";
import {SavedCart} from "../models/saved-cart.model";
import {SavedCartService} from "./saved-cart.service";

import {environment} from "../../environments/environment";
import {PatientQueueService} from "./patient-queue.service";
import { IPatient } from "../models/interfaces/patient.interface";

declare const $: any;



@Injectable()
export class PosCartService {

    private drawerService: DrawerService;
    private receiptService: ReceiptService;
    private lineItemService: LineItemService;
    private patientQueueService: PatientQueueService;

    constructor(
        protected router: Router,
        injector: Injector,
        socketService: SocketService,
        private packageService: PackageService,
        private transactionService: TransactionService,
        private taxService: TaxService,
        private transactionTaxService: TransactionTaxService,
        private storeService: StoreService,
        private printerService: PrinterService,
        private savedCartService: SavedCartService
    ) {
        this.router = router;

        storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        })

        setTimeout(() => {
            this.receiptService = injector.get<ReceiptService>(ReceiptService);
            this.lineItemService = injector.get<LineItemService>(LineItemService);
            this.drawerService = injector.get<DrawerService>(DrawerService);
            this.patientQueueService = injector.get<PatientQueueService>(PatientQueueService);
            this.drawerService.getCurrent(false, localStorage.getItem('deviceId')).take(1).subscribe(drawer => { this.drawer = drawer } )
        }, 0);






        // this.taxService.getByType(true)
        //     .subscribe(taxObservables => {
        //         let taxObs = Observable.combineLatest(taxObservables, (...taxes: ITax[]) => {
        //             return taxes;
        //         });
        //
        //         taxObs.subscribe(taxes => this.cannabisTaxes = taxes)
        //     });
        //
        // this.taxService.getByType(false)
        //     .subscribe(taxObservables => {
        //         let taxObs = Observable.combineLatest(taxObservables, (...taxes: ITax[]) => {
        //             return taxes;
        //         });
        //
        //         taxObs.subscribe(taxes => this.allTaxes = taxes)
        //     });

        this.taxService.all().subscribe(taxes => {this.allTaxes = taxes;});

        this.deleteOldReceiptsFromLocalStorage();
    }

    // public cannabisTaxes: ITax[]
    public allTaxes: ITax[];

    private drawer: IDrawer;

    store: IStore;

    public posUserId: string;

    private lineItems = new Map<string, LineItem>();

    protected cartSource = new BehaviorSubject<Cart>(this.newInstance());
    currentCartEmitted = this.cartSource.asObservable();
    public refreshCart() {
        this.cartSource.next(this.cartSource.getValue());
    }

    // savedCarts: Cart[] = [];
    protected savedCartSource = new BehaviorSubject<Cart[]>([]);
    savedCartsEmitted = this.savedCartSource.asObservable();

    public newInstance(): Cart {
        return new Cart();
    }

    public setCart(cart: Cart) {
        this.lineItems.clear();

        for (let lineItem of cart.lineItems) {
            let lineItemKey = lineItem.productVariationId;

            if(lineItem.barcodeId){
                lineItemKey += '-' + lineItem.barcodeId;
            }

            if( lineItem.isReturn ) {
              lineItemKey += "Return";
            }

            this.lineItems.set(lineItemKey, lineItem);
        }

        this.updateCart();
    }

    public updateCart() {

        let lineItems = Array.from(this.lineItems.values()).reverse();
        let newCart = this.newInstance();
        for (let lineItem of lineItems) {
            if (lineItem.ProductVariation == null) {
                //Data not added yet
                return;
            }
            //Clear taxes calculated before the update
            lineItem.Transactions.forEach(transaction => {
                transaction.TransactionTaxes = [];
            });
            newCart.lineItems.push(lineItem);
        }


        newCart.taxesIncluded = this.store.taxesIncluded;

        this.cartSource.next(newCart);

    }

    getThcGramsUsed(): number {
        // const lineItems = cart.lineItems;
        const lineItems = Array.from(this.lineItems.values()).reverse();

        const thcGrams = [];

        for (const lineItem of lineItems) {
            // Don't count thc limit for returns
            if (lineItem.isReturn) {
                continue;
            }

            const items = lineItem.ProductVariation.Items;
            const variationQuantity = lineItem.ProductVariation.quantity;
            const cartCount = lineItem.quantity;

            for (const item of items) {
                let cannabisCategory = item.ProductType.cannabisCategory;
                cannabisCategory = cannabisCategory.slice(0, 1).toLowerCase() + cannabisCategory.slice(1);

                const unitOfMeasure = item.ProductType.unitOfMeasure;

                if (unitOfMeasure === 'each') {

                    // Score for this item is based on thcWeight
                    const thcWeight = item.thcWeight ? item.thcWeight : 0;

                    thcGrams.push((thcWeight * cartCount));
                } else {
                    if (cannabisCategory === 'buds' || cannabisCategory === 'shakeTrim') {
                    // 120g of buds is 36g of concentrate
                    // 1g of bud is 0.3g of concentrate
                    thcGrams.push((Math.floor((variationQuantity * cartCount * 0.3) * 100) / 100));
                    } else {
                    thcGrams.push((variationQuantity * cartCount));
                    }
                }
            }
        }

        return thcGrams.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    }

    public releasePatientFromBudtender(patient: PatientCartWithStart, callback?) {
        this.patientQueueService.releasePatientFromBudtender(patient.patient.id, callback);
    }

    public saveCart(patient: PatientCartWithStart, callback?, skipNotification?) {

        this.patientQueueService.getByPatientId(patient.patient.id).take(1).subscribe(patientQueue => {

            if (patientQueue) {
                const savedCartData = {
                    lineItems: patient.cart.lineItems.map(lineItem => {
                        return {
                            id: lineItem.id,
                            productVariationId: lineItem.ProductVariation.id,
                            packageId: lineItem.Transactions[0].Package ? lineItem.Transactions[0].Package.id : null,
                            packageLabel: lineItem.Transactions[0].Package ? lineItem.Transactions[0].Package.Label : null,
                            quantity: (lineItem.quantity || 1)
                        };
                    })
                };

                const savedCart = this.savedCartService.newInstance();
                savedCart.patientQueueId = patientQueue.id;
                savedCart.patientId = patient.patient.id;
                savedCart.cartData = JSON.stringify(savedCartData);

                this.savedCartService.save(savedCart, callback, skipNotification);
            }
        })
    }

    public clearSavedCart(patient: PatientCartWithStart) {
        this.patientQueueService.getByPatientId(patient.patient.id).take(1).subscribe(patientQueue => {

            if (patientQueue) {
                const savedCart = this.savedCartService.newInstance();
                savedCart.patientQueueId = patientQueue.id;
                savedCart.patientId = patient.patient.id;
                savedCart.cartData = JSON.stringify({lineItems: []});

                this.savedCartService.save(savedCart);
            }
        })
    }

    //Saved carts toggle

    protected emitSavedCartsToggleSource = new Subject<void>();
    savedCartsToggleEmitted = this.emitSavedCartsToggleSource.asObservable();

    toggleSavedCarts(){
        this.emitSavedCartsToggleSource.next();
    }

    protected emitProductViewSource = new Subject<IProductVariation>();
    productViewEmitted = this.emitProductViewSource.asObservable();

    protected emitRefundDetailModalShowingSource = new BehaviorSubject<boolean>(undefined);
    refundDetailModalShowing = this.emitRefundDetailModalShowingSource.asObservable();

    protected emitReceiptForRefund = new BehaviorSubject<IReceipt>(undefined);
    receiptForRefund = this.emitReceiptForRefund.asObservable();

    protected emitManagerApprovalModalShowingSource = new BehaviorSubject<boolean>(undefined);
    managerApprovalModalShowing = this.emitManagerApprovalModalShowingSource.asObservable();

    protected emitManagerApprovalSource = new Subject;
    managerApprovalEmitted = this.emitManagerApprovalSource.asObservable();

    protected emitAgeVerificationModalShowingSource = new BehaviorSubject<boolean>(undefined);
    ageVerificationModalShowing = this.emitAgeVerificationModalShowingSource.asObservable();

    protected emitAgeVerifiedSource = new Subject;
    ageVerifiedEmitted = this.emitAgeVerifiedSource.asObservable();

    protected emitOversaleLimitModalShowingSource = new BehaviorSubject<boolean>(undefined);
    oversaleLimitModalShowing = this.emitOversaleLimitModalShowingSource.asObservable();

    protected emitPatientOversaleLimitModalShowingSource = new BehaviorSubject<boolean>(undefined);
    patientOversaleLimitModalShowing = this.emitPatientOversaleLimitModalShowingSource.asObservable();

    protected emitDeviceRegistrationModalShowingSource = new BehaviorSubject<boolean>(undefined);
    deviceRegistrationModalShowing = this.emitDeviceRegistrationModalShowingSource.asObservable();

    protected emitDeviceRegistrationType = new BehaviorSubject<string>(undefined);
    deviceRegistrationTypeEmitted = this.emitDeviceRegistrationType.asObservable();

    protected emitTransactionCompletedModalShowingSource = new BehaviorSubject<boolean>(undefined);
    transactionCompletedModalShowing = this.emitTransactionCompletedModalShowingSource.asObservable();

    protected emitCustomDiscountModalShowingSource = new BehaviorSubject<boolean>(undefined);
    customDiscountModalShowing = this.emitCustomDiscountModalShowingSource.asObservable();

    protected emitBulkFlowerModalShowingSource = new BehaviorSubject<boolean>(undefined);
    bulkFlowerModalShowing = this.emitBulkFlowerModalShowingSource.asObservable();

    protected emitBulkFlowerInformationSource = new BehaviorSubject<any>(undefined);
    bulkFlowerInformationEmitted = this.emitBulkFlowerInformationSource.asObservable();

    protected emitCustomDiscountSource = new BehaviorSubject<IDiscount[]>(undefined);
    customDiscountEmitted = this.emitCustomDiscountSource.asObservable();

    protected emitCompletedTransaction = new BehaviorSubject<IReceipt>(undefined);
    transactionCompletedEmitted = this.emitCompletedTransaction.asObservable();

    protected emitReceiptVoidModalShowingSource = new BehaviorSubject<any>(undefined);
    receiptVoidModalShowing = this.emitReceiptVoidModalShowingSource.asObservable();

    protected emitAssignPatientToPatientGroupModalShowingSource = new BehaviorSubject<any>(undefined);
    assignPatientToPatientGroupModalShowing = this.emitAssignPatientToPatientGroupModalShowingSource.asObservable();

    protected emitPinEntryModalShowingSource = new BehaviorSubject<any>(undefined);
    pinEntryModalShowing = this.emitPinEntryModalShowingSource.asObservable();

    protected emitPinEntryResult = new Subject<boolean>();
    pinEntryResult = this.emitPinEntryResult.asObservable();

    /* Manager Pin Entry Modal */
    protected emitManagerPinEntryModalShowingSource = new BehaviorSubject<boolean>(undefined);
    managerPinEntryModalShowing = this.emitManagerPinEntryModalShowingSource.asObservable();

    protected emitManagerPinEntryResult = new Subject<string>();
    managerPinEntryResult = this.emitManagerPinEntryResult.asObservable();

    protected emitNoSuccessfulManagerPinEntry = new BehaviorSubject<boolean>(undefined);
    noSuccessfulManagerPinEntry = this.emitNoSuccessfulManagerPinEntry.asObservable();

    incrementQuantity(lineItem: ILineItem) {

        let lineItemKey = lineItem.productVariationId;

        if(lineItem.barcodeId){
            lineItemKey += '-' + lineItem.barcodeId;
        }

        let existingLineItem = this.lineItems.get(lineItemKey);
        if (!existingLineItem) {
            throw new Error("Cannot increment, not in cart");
        }

        if( existingLineItem.isReturn && ( (existingLineItem.originalPurchaseQuantity - existingLineItem.originalPurchaseReturnedQuantity) < existingLineItem.quantity + 1 ) ) return false

        existingLineItem.quantity++;
        this.updateCart();

        return true
    }

    decrementQuantity(lineItem: ILineItem) {

        let lineItemKey = lineItem.productVariationId;

        if(lineItem.barcodeId){
            lineItemKey += '-' + lineItem.barcodeId;
        }

        if(lineItem.isReturn){
            lineItemKey += 'Return';
        }

        let existingLineItem = this.lineItems.get(lineItemKey);
        if (!existingLineItem) {
            throw new Error("Cannot decrement, not in cart");
        }

        if(existingLineItem.ProductVariation.isBulkFlower){
            this.removeFromCart(lineItem);
        }else{

            existingLineItem.quantity--;
            if (existingLineItem.quantity == 0) {
                // let subscription = this.subscriptionsByPackageId.get(metrcPackage.id);
                // subscription.unsubscribe();

                this.lineItems.delete(lineItemKey);
                //Clear product view modal
                this.emitProductViewSource.next(null);
                // this.subscriptionsByPackageId.delete(metrcPackage.id);
            }
            return this.updateCart();

        }
    }

    removeFromCart(lineItem: ILineItem) {

        let lineItemKey = lineItem.productVariationId;

        if(lineItem.barcodeId){
            lineItemKey += '-' + lineItem.barcodeId;
        }

        let existingLineItem = this.lineItems.get(lineItemKey);
        if(!existingLineItem){
            throw new Error('Cannot not decrement to zero, not in cart');
        }

        this.lineItems.delete(lineItemKey);

        const clearCart = Boolean( existingLineItem.isReturn && this.lineItems.size === 0 )

        if(!clearCart) this.updateCart();

        return clearCart

    }

    addBulkProductVariationToCart(productVariation: IProductVariation, packages: IPackage[], barcodeId: string, quantity: number){
        console.log("Received: ");
        console.log(productVariation);
        console.log(packages);
        console.log(barcodeId);
        console.log(quantity);

        this.addProductVariationToCart(productVariation, packages, barcodeId);
        let lineItemKey = productVariation.id + '-' + barcodeId;
        this.setLineItemQuantity(lineItemKey, quantity);

    }

    //lineItemKey is the product variation id concatenated with the barcode id by a hyphen (see below)
    setLineItemQuantity(lineItemKey: string, quantity: number){

        let existingLineItem = this.lineItems.get(lineItemKey);
        if(existingLineItem){
            existingLineItem.quantity = quantity;
            return this.updateCart();
        }

    }

    getLineItemQuantity(lineItemKey: string){
        let existingLineItem = this.lineItems.get(lineItemKey);
        if(existingLineItem){
            return existingLineItem.quantity;
        }else{
            return null;
        }
    }

    addProductVariationToCart(productVariation: IProductVariation, packages?: IPackage[], barcodeId?: string, fromSavedCart?: boolean) {

        //Note: removed drawer check because pos drawer guard wouldn't allow you to get here without an open drawer

        let lineItemKey = productVariation.id;

        if(barcodeId){
            lineItemKey += '-' + barcodeId;
        }

        let existingLineItem = this.lineItems.get(lineItemKey);
        if(existingLineItem && !existingLineItem.isReturn) {
            existingLineItem.quantity++;
            return this.updateCart();
        }


        existingLineItem = this.lineItemService.newInstance();
        existingLineItem.Transactions = [];
        if(packages) {
            for (let _package of packages) {
                let transaction = this.transactionService.newInstance();
                transaction.storeId = this.store.id;
                transaction.lineItemId = existingLineItem.id;
                transaction.packageId = _package.id;
                transaction.Package = _package;
                transaction.productId = productVariation.Product.id;
                transaction.Product = productVariation.Product;
                transaction.productVariationId = productVariation.id;
                transaction.ProductVariation = productVariation;
                transaction.itemId = _package.itemId;
                transaction.TransactionTaxes = [];

                existingLineItem.Transactions.push(transaction);
            }
        }else{
            for(let item of productVariation.Items) {
                let transaction = this.transactionService.newInstance();
                transaction.storeId = this.store.id;
                transaction.lineItemId = existingLineItem.id;
                transaction.productId = productVariation.Product.id;
                transaction.Product = productVariation.Product;
                transaction.productVariationId = productVariation.id;
                transaction.ProductVariation = productVariation;
                transaction.itemId = item.id;
                transaction.Item = item;
                transaction.TransactionTaxes = [];

                existingLineItem.Transactions.push(transaction);
            }
        }


        if(barcodeId){
            existingLineItem.barcodeId = barcodeId;
        }else{
            existingLineItem.barcodeId = null;
        }
        existingLineItem.storeId = this.store.id;
        existingLineItem.quantity = 1;
        existingLineItem.price = productVariation.price;
        existingLineItem.productVariationId = productVariation.id;
        existingLineItem.ProductVariation = productVariation;
        existingLineItem.productId = productVariation.Product.id;
        existingLineItem.Product = productVariation.Product;

        if (fromSavedCart) {
            existingLineItem.fromSavedCart = true;
        }

        this.lineItems.set(lineItemKey, existingLineItem);

        return this.updateCart();
    }

    isOnlyReturns() {
        let isOnlyReturns = true

        this.lineItems.forEach( lineItem => {
            if( !lineItem.isReturn ) { isOnlyReturns = false; }
        } )

        return isOnlyReturns
    }

    confirmTransactionsHavePackages(){

        for(let lineItem of Array.from(this.lineItems.values())){
            let transactions = lineItem.Transactions;
            for(let transaction of transactions){
                if(!transaction.packageId){
                    return false;
                }
            }
        }

        return true;

    }

    confirmPackagesContainEnoughProductQuantity() {
        for(const lineItem of Array.from(this.lineItems.values())){
            const transactions = lineItem.Transactions;
            for(const transaction of transactions){
                if(!transaction.Package) {
                    return `There are products without packages selected.`;
                }
                if(!this.doesPackageContainSufficientQuantity(lineItem.Product.id, transaction.Package)) {
                    return `The package ${transaction.Package.Label} doesn't have enough quantity to complete the transaction.`;
                }
            }
        }
        return true;
    }

    doesPackageContainSufficientQuantity(productId, thePackage: IPackage): Boolean {
        let totalQuantityInLineItems = 0;
        for(const lineItem of Array.from(this.lineItems.values())){
            const transactions = lineItem.Transactions;
            for(const transaction of transactions){
                if(lineItem.Product.id == productId && transaction.Package && transaction.Package.Label == thePackage.Label) {
                    if(lineItem.Product.Item.UnitOfMeasureAbbreviation == "ea") {
                        totalQuantityInLineItems += lineItem.quantity;
                    } else {
                        totalQuantityInLineItems += lineItem.ProductVariation.quantity * lineItem.quantity;
                    }
                }
            }
        }
        console.log("************* totalized: ", totalQuantityInLineItems, thePackage.Quantity);
        if(totalQuantityInLineItems > thePackage.Quantity) {
            return false;
        } else {
            return true;
        }
    }

    calculateLineItemPrices(cart: Cart): Observable<Cart>{

        let lineItems = cart.lineItems;

        let lineItemData = {
            'mix-match' : [],
            'matching-only': [],
            'each': [],
            'non-pricing-tier': [],
            'return': []
        };

        for(let lineItem of lineItems){

            if(lineItem.isReturn){
                lineItemData.return.push(lineItem);
                continue;
            }

            let pricingTier = lineItem.Product.PricingTier;
            if(pricingTier){

                lineItemData[pricingTier.mode].push(lineItem);

            }else{

                lineItemData['non-pricing-tier'].push(lineItem);

            }

        }

        let updatedLineItemData = {
            'mix-match': this.calculateMixMatchTierPrices(lineItemData['mix-match']),
            'matching-only': this.calculateMatchingOnlyTierPrices(lineItemData['matching-only']),
            'each': this.calculateEachBasedTierPrices(lineItemData['each']),
            'non-pricing-tier': this.calculateNonPricingTierPrices(lineItemData['non-pricing-tier']),
            'return': this.calculateReturnPrices(lineItemData.return)
        };

        let updatedLineItems = [];

        Object.keys(updatedLineItemData).forEach(key => {

            let lineItems = updatedLineItemData[key];

            updatedLineItems = updatedLineItems.concat(lineItems);

        });

        cart.lineItems = updatedLineItems;

        return Observable.of(cart);


        // let updatedLineItems = [];
        //
        // let lineItems = cart.lineItems;
        // let pricingTiers = {}; //Keyed by id
        // let weightByTier = {};
        // let priceByTier = {};
        // for(let lineItem of lineItems){
        //     let pricingTierId = lineItem.Product.pricingTierId;
        //     let pricingTier = lineItem.Product.PricingTier;
        //     //If pricing tier is not a standalone tier, then proceed normally
        //     if(pricingTier) {
        //         if (!pricingTier.standalone) {
        //             pricingTiers[pricingTierId] = pricingTier;
        //             weightByTier[pricingTierId] = 0;
        //             priceByTier[pricingTierId] = 0;
        //         } else {
        //             //If pricing tier is standalone, calculate its price right here and add to updated lineItems
        //             let unitPrice = ProductVariationService.getPriceFromTier(lineItem.ProductVariation, pricingTier);
        //             lineItem.unitPrice = unitPrice;
        //             lineItem.price = unitPrice * lineItem.ProductVariation.quantity * lineItem.quantity;
        //             updatedLineItems.push(lineItem);
        //             alreadyUpdatedLineItemIds.push(lineItem.id);
        //         }
        //     }
        // }
        //
        // for(let lineItem of lineItems){
        //     if(lineItem.Product.inventoryType == 'weight'){
        //         let productWeight = lineItem.ProductVariation.quantity * lineItem.quantity;
        //         let pricingTierId = lineItem.Product.pricingTierId;
        //         weightByTier[pricingTierId] += productWeight;
        //     }
        // }
        //
        // Object.keys(weightByTier).forEach(pricingTierId => {
        //     console.log(pricingTierId);
        //     let pricingTier = pricingTiers[pricingTierId];
        //     if(pricingTier) {
        //         let weight = weightByTier[pricingTierId];
        //         let tierPrice = -1;
        //         pricingTier.PricingTierWeights.forEach(tierWeight => {
        //
        //             if (weight >= tierWeight.weight) {
        //                 tierPrice = tierWeight.price;
        //             }
        //
        //         });
        //
        //         priceByTier[pricingTierId] = tierPrice;
        //     }
        //
        // });
        //
        // for(let lineItem of lineItems){
        //     if( lineItem.isReturn ) {
        //         if(lineItem.quantity == lineItem.purchaseLineItemQuantity) {
        //             lineItem.price = lineItem.purchaseLineItemPrice
        //         } else {
        //             const ratio = lineItem.quantity / lineItem.purchaseLineItemQuantity
        //             lineItem.price = ratio * lineItem.purchaseLineItemPrice
        //         }
        //     } else if(lineItem.Product.inventoryType == 'weight') {
        //         if(alreadyUpdatedLineItemIds.indexOf(lineItem.id) === -1) {
        //             let pricingTierId = lineItem.Product.pricingTierId;
        //             let unitPrice = priceByTier[pricingTierId];
        //
        //             lineItem.unitPrice = unitPrice;
        //             lineItem.price = unitPrice * lineItem.ProductVariation.quantity * lineItem.quantity;
        //         }
        //     }else{
        //         lineItem.price = lineItem.ProductVariation.price * lineItem.quantity;
        //     }
        //     if(alreadyUpdatedLineItemIds.indexOf(lineItem.id) === -1){
        //         updatedLineItems.push(lineItem);
        //     }
        // }
        //
        // cart.lineItems = updatedLineItems;
        //
        // return Observable.of(cart);
    }

    private calculateReturnPrices(lineItems: ILineItem[]): ILineItem[]{
        let updatedLineItems = [];

        for(let lineItem of lineItems){
            if(lineItem.quantity == lineItem.originalPurchaseQuantity) {
                lineItem.price = lineItem.Transactions[0].originalTransactionTotalPrice * -1;
            } else {
                const ratio = lineItem.quantity / lineItem.originalPurchaseQuantity;
                lineItem.price = lineItem.Transactions[0].originalTransactionTotalPrice * ratio * -1;
            }
            lineItem.Transactions.forEach( transaction => {
                transaction.TotalPrice = lineItem.price;
                transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity;
            } );
            updatedLineItems.push(lineItem);
        }

        return updatedLineItems;
    }

    private calculateNonPricingTierPrices(lineItems: ILineItem[]): ILineItem[]{
        let updatedLineItems = [];

        for(let lineItem of lineItems){
            lineItem.price = lineItem.ProductVariation.price * lineItem.quantity;
            lineItem.Transactions.forEach( transaction => {
                transaction.TotalPrice = lineItem.price;
                transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity
            } );
            updatedLineItems.push(lineItem);
        }

        return updatedLineItems;
    }

    private calculateMixMatchTierPrices(lineItems: ILineItem[]): ILineItem[]{

        let updatedLineItems = [];

        let pricingTiers = {}; //Keyed by id
        let weightByTier = {};
        let priceByTier = {};
        for(let lineItem of lineItems){
            let pricingTierId = lineItem.Product.pricingTierId;
            let pricingTier = lineItem.Product.PricingTier;
            if(pricingTier) {
                pricingTiers[pricingTierId] = pricingTier;
                weightByTier[pricingTierId] = 0;
                priceByTier[pricingTierId] = 0;
            }
        }

        for(let lineItem of lineItems){
            if(lineItem.Product.inventoryType == 'weight'){
                let productWeight = lineItem.ProductVariation.quantity * lineItem.quantity;
                let pricingTierId = lineItem.Product.pricingTierId;
                weightByTier[pricingTierId] += productWeight;
            }
        }

        Object.keys(weightByTier).forEach(pricingTierId => {
            let pricingTier = pricingTiers[pricingTierId];
            if(pricingTier) {
                let weight = weightByTier[pricingTierId];
                let tierPrice = -1;
                pricingTier.PricingTierWeights.forEach(tierWeight => {

                    if (weight >= tierWeight.weight) {
                        tierPrice = tierWeight.price;
                    }

                });

                priceByTier[pricingTierId] = tierPrice;
            }

        });

        for(let lineItem of lineItems){

            let pricingTierId = lineItem.Product.pricingTierId;
            let unitPrice = priceByTier[pricingTierId];

            lineItem.unitPrice = unitPrice;
            lineItem.price = unitPrice * lineItem.ProductVariation.quantity * lineItem.quantity;

            lineItem.Transactions.forEach( transaction => {
                transaction.TotalPrice = lineItem.price;
                transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity;
            } );

            updatedLineItems.push(lineItem);
        }

        return updatedLineItems;

    }

    private calculateMatchingOnlyTierPrices(lineItems: ILineItem[]): ILineItem[]{

        let updatedLineItems = [];

        //Matching only means that within an individual line item
        //Key is product variation id
        let productVariationPricingTiers = {}; //value - pricingTier
        let productVariationWeights = {}; //value - weight by product variation
        let productVariationPrices = {}; //value - price per gram by product variation
        for(let lineItem of lineItems){
            let productVariationId = lineItem.productVariationId;
            let pricingTier = lineItem.Product.PricingTier;
            if(pricingTier) {
                if(!productVariationPricingTiers[productVariationId]){
                    productVariationPricingTiers[productVariationId] = pricingTier;
                    productVariationWeights[productVariationId] = 0;
                    productVariationPrices[productVariationId] = 0;
                }
            }
        }

        for(let lineItem of lineItems){
            if(lineItem.Product.inventoryType == 'weight'){
                let productWeight = lineItem.ProductVariation.quantity * lineItem.quantity;
                let productVariationId = lineItem.productVariationId;
                productVariationWeights[productVariationId] += productWeight;
            }
        }

        Object.keys(productVariationWeights).forEach(productVariationId => {
            let pricingTier = productVariationPricingTiers[productVariationId];
            if(pricingTier) {
                let weight = productVariationWeights[productVariationId];
                let tierPrice = -1;
                pricingTier.PricingTierWeights.forEach(tierWeight => {

                    if (weight >= tierWeight.weight) {
                        tierPrice = tierWeight.price;
                    }

                });

                productVariationPrices[productVariationId] = tierPrice;
            }

        });

        for(let lineItem of lineItems){

            let productVariationId = lineItem.productVariationId;
            let unitPrice = productVariationPrices[productVariationId];

            lineItem.unitPrice = unitPrice;
            lineItem.price = unitPrice * lineItem.ProductVariation.quantity * lineItem.quantity;

            lineItem.Transactions.forEach( transaction => {
                transaction.TotalPrice = lineItem.price;
                transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity
            } );

            updatedLineItems.push(lineItem);
        }

        return updatedLineItems;

    }

    private calculateEachBasedTierPrices(lineItems: ILineItem[]): ILineItem[]{

        let updatedLineItems = [];

        for(let lineItem of lineItems){
            let pricingTier = lineItem.Product.PricingTier;

            if(pricingTier){

                let unitPrice = ProductVariationService.getPriceFromTier(lineItem.ProductVariation, pricingTier);
                lineItem.unitPrice = unitPrice;
                lineItem.price = unitPrice * lineItem.ProductVariation.quantity * lineItem.quantity;

                lineItem.Transactions.forEach( transaction => {
                    transaction.TotalPrice = lineItem.price;
                    transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity
                } );

                updatedLineItems.push(lineItem);

            }
        }

        return updatedLineItems;

    }

    private setTransactionTotalPrice(lineItem: ILineItem, transaction: ITransaction, numTransactions: number){

        console.log("Setting transaction price");

        console.log(`LineItem Price: ${lineItem.price}`);
        console.log(`Tax IS ${!this.store.taxesIncluded ? "NOT " : ""}INCLUDED`);

        if(this.store.taxesIncluded){
            transaction.TotalPrice = (lineItem.price) / numTransactions - transaction.discountAmount;
        }else{
            transaction.TotalPrice = ((lineItem.price) + transaction.tax) / numTransactions - transaction.discountAmount;
        }

        console.log(`Transaction TotalPrice is now: ${transaction.TotalPrice}`);

        transaction.QuantitySold = lineItem.quantity * lineItem.ProductVariation.quantity;

    }

    submitCart(userId: string, paymentMethod: string, amountPaid: number, transactionTime: number, patientId: string, caregiverId: string, drawer: IDrawer, giftcardTransactionId: string) {

        if (this.lineItems.size < 1) {
           return false;
        }

        console.log('Submitting user cart', this.lineItems);

        let receipt = this.receiptService.newInstance();
        receipt.storeId = this.store.id;
        receipt.userId = userId;
        receipt.paymentMethod = paymentMethod;
        receipt.giftcardTransactionId = giftcardTransactionId;
        receipt.transactionTime = transactionTime;
        receipt.amountPaid = amountPaid
        receipt.drawerId = drawer.id;
        receipt.patientId = patientId;
        receipt.caregiverId = caregiverId;

        let lineItemsToSave = [];

        for(let lineItem of Array.from(this.lineItems.values())){
            lineItem.receiptId = receipt.id;
            let transactions = lineItem.Transactions;
            let numTransactions = transactions.length;

            let transactionsToSave = [];

            for(let transaction of transactions){
                transaction.receiptId = receipt.id;

                //Only do this for non returns
                if(!transaction.isReturn){
                    this.setTransactionTotalPrice(lineItem, transaction, lineItem.Transactions.length);
                }


                let transactionTaxes = transaction.TransactionTaxes;

                let transactionToSave = new Transaction(transaction);
                transactionToSave.TransactionTaxes = transactionTaxes;
                transactionToSave.itemId = transaction.itemId ? transaction.itemId : (transaction.Item ? transaction.Item.id : null);
                transactionToSave.Item = undefined;
                transactionToSave.Package = undefined;
                transactionToSave.Product = undefined;
                transactionToSave.ProductVariation = undefined;
                transactionsToSave.push(transactionToSave);
            }

            lineItem.Transactions = transactionsToSave;
            let lineItemToSave = new LineItem(lineItem);
            lineItemToSave.Discount = undefined;
            lineItemToSave.Product = undefined;
            lineItemToSave.ProductVariation = undefined;
            lineItemsToSave.push(lineItemToSave);

        }

        receipt.LineItems = lineItemsToSave;

        let receiptKey = "RECEIPT-" + moment().format('X');

        localStorage.setItem(receiptKey, JSON.stringify(receipt));

        this.receiptService.insert(receipt)
            .then((result) => {
                receipt.barcode = result.receiptBarcode;
                receipt.createdAt = result.createdAt;
                this.printerService.printReceipt(receipt, this.store);
                if(!environment.printPatientLabels){
                    this.printerService.printTransactionLabels(receipt, this.store);
                }else{
                    this.printerService.printPatientLabels(receipt, this.store);
                }
                this.printerService.printBulkFlowerLabels(receipt, this.store);
                this.printerService.openDrawer();
                if(!drawer.Receipts) drawer.Receipts = [ ];
                drawer.Receipts.push(receipt);
                this.transactionCompleted(receipt);
                this.showTransactionCompletedModal();
                this.setCart(this.newInstance());

                if(environment.shouldShowPatientQueue){
                    this.patientQueueService.removeByPatientId(patientId);
                }
                this.drawerService.getCurrent(true, localStorage.getItem('deviceId')).subscribe(drawer => {
                    if (drawer){
                        console.log("Current: " + drawer.currentBalance);
                        console.log("Limit: " + this.store.settings.drawerAmountForAlert);

                        if (this.store && this.store.settings.enableDrawerLimit && this.store.settings.drawerAmountForAlert
                            && drawer.currentBalance > this.store.settings.drawerAmountForAlert ) {

                            console.log("Drawer Limit Alert Should Now Be Included");
                            this.drawerService.settingDrawerLimitCheck(true);

                        }
                    }
                });

                if(result.metrcError){
                    setTimeout(() => {
                        alert("The transaction was completed successfully, but was not reported to Metrc. Please use the manual Submit to Metrc button soon so that this transaction is reported in a timely manner");
                    }, 0);
                }

                this.packageService.checkLowInventoryPackage(receipt.LineItems.map(lineItem => lineItem.Transactions[0].itemId));

            })
            .catch((err) => {
                console.error(err);
                alert(err.message);
            });

    }


    clearTax(cart: Cart) {
        cart.tax = 0;

        let lineItems = cart.lineItems.filter(lineItem => !lineItem.isReturn);

        for(let lineItem of lineItems) {
            for(let transaction of lineItem.Transactions) {
                transaction.TransactionTaxes = [];
            }
        }
    }

    calculateTax(cart: Cart){

        let lineItems = cart.lineItems.filter(lineItem => !lineItem.isReturn);

        if(!this.store.taxesIncluded){
            if (this.allTaxes && this.allTaxes.length) {
                for (let tax of this.allTaxes) {

                    for (let lineItem of lineItems) {

                        let category = lineItem.Product.ProductType.category;

                        if (category == 'cannabis' && tax.appliesToCannabis || category == 'non-cannabis' && tax.appliesToNonCannabis) {
                            //Apply tax
                            let percent = tax.percent / 100;
                            let taxAmount = (lineItem.price - lineItem.discountAmount) * percent;

                            let transactions = lineItem.Transactions;
                            let numTransactions = transactions.length;
                            let taxAmountPerTransaction = taxAmount / numTransactions;
                            transactions.forEach(transaction => {
                                let transactionTax = this.transactionTaxService.newInstance();
                                transactionTax.transactionId = transaction.id;
                                transactionTax.taxId = tax.id;
                                transactionTax.amount = taxAmountPerTransaction;
                                transaction.TransactionTaxes.push(transactionTax);
                            });
                        }

                    }

                }
            }

        }else{
            for(let lineItem of lineItems){
                let category = lineItem.Product.ProductType.category;
                let effectiveRate = 0;
                for(let tax of this.allTaxes){
                    if(category == 'cannabis' && tax.appliesToCannabis || category == 'non-cannabis' && tax.appliesToNonCannabis){
                        effectiveRate += tax.percent;
                    }
                }

                let effectivePrice = lineItem.price - lineItem.discountAmount;

                //Effective rate needs to be divided by 100
                //totalTax = ((price * etr) / 100) / ((100 + etr) / 100)
                //totalTax = (price *etr) / (100 + etr)
                let totalTax = (effectivePrice * effectiveRate) / (100 + effectiveRate);
                for(let tax of this.allTaxes){
                    if(category == 'cannabis' && tax.appliesToCannabis || category == 'non-cannabis' && tax.appliesToNonCannabis){
                        let proportionOfEffective = tax.percent / effectiveRate;
                        let taxAmount = totalTax * proportionOfEffective;

                        let transactions = lineItem.Transactions;
                        let numTransactions = transactions.length;
                        let taxAmountPerTransaction = taxAmount / numTransactions;
                        transactions.forEach(transaction => {
                            let transactionTax = this.transactionTaxService.newInstance();
                            transactionTax.transactionId = transaction.id;
                            transactionTax.taxId = tax.id;
                            transactionTax.amount = taxAmountPerTransaction;
                            transaction.TransactionTaxes.push(transactionTax);
                        });
                    }
                }

            }
        }


        cart.tax = lineItems.reduce((sum, lineItem) => {return sum + lineItem.tax}, 0);

    }

    refundPreviousPurchase() {
        let $dialog = $(`<div class="input-row" style="margin: 0">
                            <input placeholder="Scan or Enter Receipt ID" />
                        </div>`);
        $dialog
            .dialog({
                title: 'Refund previous purchase',
                modal: true,
                resizable: false,
                draggable: false,
                buttons: [
                    {
                        text: 'Cancel',
                        "class": 'dialog-button-cancel',
                        click: () => {
                            $dialog.dialog('close');
                        }
                    },
                    {
                        text: 'Lookup Receipt',
                        "class": 'dialog-button-lookup-receipt',
                        click: () => {
                            return this.refundDetailModal($dialog.find('input').val())
                        }
                    },
                    //Test button
                    {
                        text: 'Open detailed',
                        click: () => {
                            this.emitRefundDetailModalShowingSource.next(true);
                            $dialog.dialog('close');
                        }
                    }
                ]
            })
    }

    refundDetailModal(receiptBarcode: string) {
        //Note: The drawer check was removed from here. It has been moved to the refund detail modal

        this.receiptService.getByBarcode(receiptBarcode).take(1).subscribe(receipt => {
            this.emitRefundDetailModalShowingSource.next(true);
            this.emitReceiptForRefund.next(receipt);
        });
    }

    hideRefundDetailModal(){
        this.emitRefundDetailModalShowingSource.next(false);
    }

    showManagerApprovalModal(){
        this.emitManagerApprovalModalShowingSource.next(true);
    }

    hideManagerApprovalModal(){
        this.emitManagerApprovalModalShowingSource.next(false);
    }

    managerApproval(result: boolean){
        this.emitManagerApprovalSource.next(result);
    }

    showAgeVerificationModal(){
        this.emitAgeVerificationModalShowingSource.next(true);
    }

    hideAgeVerificationModal(){
        this.emitAgeVerificationModalShowingSource.next(false);
    }

    ageVerified(result: boolean){
        this.emitAgeVerifiedSource.next(result);
    }

    showOversaleLimitModal(){
        this.emitOversaleLimitModalShowingSource.next(true);
    }

    showPatientOversaleLimitModal(){
        this.emitPatientOversaleLimitModalShowingSource.next(true);
    }

    hideOversaleLimitModal(){
        this.emitOversaleLimitModalShowingSource.next(false);
    }

    hidePatientOversaleLimitModal(){
        this.emitPatientOversaleLimitModalShowingSource.next(false);
    }

    showDeviceRegistrationModal(){
        this.emitDeviceRegistrationModalShowingSource.next(true);
    }

    hideDeviceRegistrationModal(){
        this.emitDeviceRegistrationModalShowingSource.next(false);
    }

    showTransactionCompletedModal(){
        this.emitTransactionCompletedModalShowingSource.next(true);
    }

    hideTransactionCompletedModal(){
        this.emitTransactionCompletedModalShowingSource.next(false);
    }

    showCustomDiscountModal(){
        this.emitCustomDiscountModalShowingSource.next(true);
    }

    hideCustomDiscountModal(){
        this.emitCustomDiscountModalShowingSource.next(false);
    }

    showBulkFlowerModal(){
        this.emitBulkFlowerModalShowingSource.next(true);
    }

    hideBulkFlowerModal(){
        this.emitBulkFlowerModalShowingSource.next(false);
    }

    emitBulkFlowerInformation(infoObj: any){
        this.emitBulkFlowerInformationSource.next(infoObj);
    }

    emitCustomDiscount(discounts: IDiscount[]){
        this.emitCustomDiscountSource.next(discounts);
    }

    deviceRegistrationType(type: string){
        this.emitDeviceRegistrationType.next(type);
    }

    transactionCompleted(receipt: IReceipt) {
        this.emitCompletedTransaction.next(receipt)
    }

    viewProduct(productVariation: IProductVariation){

        this.emitProductViewSource.next(productVariation);
    }

    showReceiptVoidModal(receipt: IReceipt){
        this.emitReceiptVoidModalShowingSource.next(receipt);
    }

    hideReceiptVoidModal(){
        this.emitReceiptVoidModalShowingSource.next(false);
    }

    showPinEntryModal(){
        this.emitPinEntryModalShowingSource.next(true);
    }

    hidePinEntryModal(){
        this.emitPinEntryModalShowingSource.next(false);
    }

    showManagerPinEntryModal(){
        this.emitManagerPinEntryModalShowingSource.next(true);
    }

    hideManagerPinEntryModal(){
        this.emitManagerPinEntryModalShowingSource.next(false);
    }

    pinEntrySuccess(userId) {
        this.posUserId = userId;
        this.emitPinEntryResult.next(true);
    }

    managerPinEntrySuccess(userId) {
        this.emitManagerPinEntryResult.next(userId);
    }

    managerPinModalClosedWithoutSuccess(result: boolean){
        this.emitNoSuccessfulManagerPinEntry.next(result);
    }

    showAssignPatientToPatientGroupModal(patient: IPatient) {
        this.emitAssignPatientToPatientGroupModalShowingSource.next(patient);
    }

    hideAssignPatientToPatientGroupModal() {
        this.emitAssignPatientToPatientGroupModalShowingSource.next(false);
    }

    // By default older than 3 days (changed from 1 week)
    deleteOldReceiptsFromLocalStorage(olderThan: number = 259200) {
        Object.keys(localStorage).forEach(storageKey => {
            if (storageKey.indexOf('RECEIPT-') === 0){
                const receiptAge = Math.floor((new Date().getTime())/1000) - parseInt(storageKey.substr(8), 10);

                if (receiptAge > olderThan) {
                    console.log(`Deleting receipt ${storageKey} because it's too old (${receiptAge}s.)`);
                    localStorage.removeItem(storageKey);
                }
            }
        })
    }
}
