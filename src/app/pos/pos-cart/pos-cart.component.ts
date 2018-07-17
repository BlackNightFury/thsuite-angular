import {
    Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output,
    ViewChild,
    Renderer2
} from "@angular/core";
import {PosCartService} from "../../services/pos-cart.service";
import {Discount} from "../../models/discount.model";
import {IProductVariation} from "../../models/interfaces/product-variation.interface";
import {ILineItem} from "../../models/interfaces/line-item.interface";
import {ICustomer} from "../../models/interfaces/customer.interface";
import {CommonAdapter} from "../../util/select2-adapters/common-adapter";
import {PackageService} from "../../services/package.service";
import * as Bluebird from 'bluebird';
import {DiscountService} from "../../services/discount.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {IDiscount} from "../../models/interfaces/discount.interface";
import {Observable} from "rxjs/Observable";
import {IUser} from "../../models/interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {StoreService} from "../../services/store.service";
import {IStore} from "../../models/interfaces/store.interface";
import {StoreOversaleLimitService} from "../../services/store-oversale-limit.service";
import {PatientOversaleLimitService} from "../../services/patient-oversale-limit.service";
import {PatientCartWithStart} from "app/pos/pos-patient-queue/patient-cart-with-start";
import {Cart} from "../../models/cart.model";
import {PatientService} from "../../services/patient.service";
import {LoyaltyRewardService} from "../../services/loyalty-reward.service";
import {LoyaltyReward} from "../../models/loyalty-reward.model";
import {DrawerService} from "../../services/drawer.service";
import {SavedCartService} from "../../services/saved-cart.service";
import {IDrawer} from "../../models/interfaces/drawer.interface";
import {ProductVariationService} from "../../services/product-variation.service";
import {Subscription} from "rxjs/Subscription";
import {DataArrayAdapter} from "../../util/select2-adapters/data-array-adapter";
import * as uuid from 'uuid';
import { DragScrollModule } from 'angular2-drag-scroll';
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-pos-cart',
    templateUrl: './pos-cart.component.html',
    styleUrls: [ './pos-cart.component.css' ]
})
export class CartComponent implements OnInit, OnDestroy {

    @ViewChild('cashInput') cashInput: ElementRef;

    // cart: Cart;
    get cart(): Cart {
        return this.patient && this.patient.cart;
    }

    get finalCartTotal(): number{
        return ( this.cart.total - this.cart.discountAmount - this.cart.returnAmount );
    }

    stateOptions = {};

    // discount: Discount;
    // discountAmount: number = 0;

    returnIncrementError: string = '';
    returnIncrementErrorId: string = '';

    discountCodeSelect2Options: Select2Options;
    selectedDiscountId: string;

    loyaltyDiscountFilters: any = {};
    loyaltyDiscountSelect2Options: Select2Options;
    selectedLoyaltyDiscountId: string;
    selectedLoyaltyDiscount: LoyaltyReward;

    lineItemSelect2Options: Select2Options = {
        placeholder: "Select a line item..."
    };
    selectedLineItemId: string;

    step: 'cart'|'checkout'= 'cart';

    amountPaid: number;
    giftcardTransactionId: string;
    customer: ICustomer;
    savedCustomer: ICustomer;

    drawer: IDrawer;

    get gramsAvailable(): number|null {
        if ( this.patient && this.patient.patient && this.patient.patient.gramLimit !== 0 ) {
            const currentGramsUsed: number = this.cartService.getThcGramsUsed();
            return this.patient.patient.gramLimit - currentGramsUsed;
        } else {
            return null;
        }
    }
    isExpandableMenuOpen = false;
    @Input() patient: PatientCartWithStart;
    get isGuestPatient(): boolean {
        return this.patient.patient.medicalStateId == null || this.patient.patient.medicalStateId === "";
    };

    @Output() savePatient: EventEmitter<PatientCartWithStart> = new EventEmitter();
    @Output() finishPatient: EventEmitter<PatientCartWithStart> = new EventEmitter();


    notPaid: boolean = false;
    notEnough: boolean = false;
    cartPriceTooLow: boolean = false;
    missingGiftcardTransactionId: boolean = false;
    packageErrors = false;
    packageQuantityError = false;
    packageQuantityErrorMessage = "";

    oversaleError: boolean = false;

    minutesString: string = '00';
    secondsString: string = '00';
    secondsTotal: number = 0;
    timerIntervalId: any;

    user: IUser;
    store: IStore;

    customDiscounts: IDiscount[] = [];

    /////TODO
    protected manualDiscountSource = new BehaviorSubject<string>(undefined);
    manualDiscountEmitted = this.manualDiscountSource.asObservable();

    protected customDiscountSource = new BehaviorSubject<IDiscount[]>(undefined);
    customDiscountEmitted = this.customDiscountSource.asObservable();

    protected loyaltyRewardSource = new BehaviorSubject<LoyaltyReward>(undefined);
    loyaltyRewardEmitted = this.loyaltyRewardSource.asObservable();

    protected punchCardSource = new BehaviorSubject<string>(undefined);
    punchCardLineItemIdEmitted = this.punchCardSource.asObservable();

    protected discountRefreshSource = new BehaviorSubject<string>(undefined);
    discountRefreshEmitted = this.discountRefreshSource.asObservable();

    paymentMethod: string = 'cash';

    private userEmittedSubscription: Subscription;
    private currentStoreEmittedSubscription: Subscription;
    private currentCartEmittedSubscription: Subscription;
    private manualDiscountSubscription: Subscription;
    private managerApprovalSubscription: Subscription;
    private customManagerApprovalSubscription: Subscription;
    private customDiscountEmittedSubscription: Subscription;
    private cartPinEntryResultSubscription: Subscription;

    public environment;

    constructor(
        private cartService: PosCartService,
        private packageService: PackageService,
        private discountService: DiscountService,
        private userService: UserService,
        private storeService: StoreService,
        private storeOversaleLimitService: StoreOversaleLimitService,
        private patientOversaleLimitService: PatientOversaleLimitService,
        private patientService: PatientService,
        private loyaltyRewardService: LoyaltyRewardService,
        private drawerService: DrawerService,
        private productVariationService: ProductVariationService,
        private savedCartService: SavedCartService,
        private renderer: Renderer2
    ) {
        this.renderer.addClass(document.body, 'pos-cart-open');
    }

    ngOnInit() {
        //Default to CO
        if(environment.shouldShowStateSelector){
            this.patient.patient.state = "CO";
        }else{
            this.patient.patient.state = null;
        }

        this.environment = environment;

        // DataArrayAdapter()
        //     .then(adapter => {
        //         console.log(adapter);
        //         this.lineItemSelect2Options['dataAdapter'] = adapter;
        //     });

        console.log("Setting cart to", this.patient.cart);
        this.cartService.setCart(this.patient.cart);

        let getCartState;

        if (this.patient.patientQueueId) {
            getCartState = this.savedCartService.getByPatientQueueId(this.patient.patientQueueId).take(1).toPromise();
        } else {
            // Just a dummy promise if we don't have patients queue
            getCartState = new Promise(resolve => setTimeout(resolve, 1));
        }

        getCartState.then(savedCart => {
            let cartData = null;

            if (savedCart && savedCart.cartData) {
                try {
                    cartData = JSON.parse(savedCart.cartData);
                } catch (e) {
                    console.error(e);
                    cartData = null;
                }
            }

            console.log('Saved cart detected', cartData);

            if (cartData && cartData.lineItems && cartData.lineItems.length) {
                const productVariationObservables = cartData.lineItems.reverse().map(lineItem => {
                    const { productVariationId, packageId, quantity } = lineItem;

                    return Observable.combineLatest(
                        productVariationId ? this.productVariationService.getAssociated(productVariationId) : Observable.of(undefined),
                        packageId ? this.packageService.getAssociated(packageId) : Observable.of(undefined),
                        Observable.of(quantity)
                    ).map(([productVariation, _package, itemQuantity]) => ({ productVariation, _package, itemQuantity }));
                });

                Observable.combineLatest(productVariationObservables).take(1).subscribe((items: any[]) => {
                    items.forEach(item => {
                        if (item.productVariation) {
                            const quantity = (item.itemQuantity || 1);
                            console.log(`Adding saved item (quantity: ${quantity}) to cart`, item);

                            for (let i = 0; i < quantity; i++) {
                              this.cartService.addProductVariationToCart(item.productVariation, item._package ? [item._package] : undefined, undefined, true);
                            }
                        }
                    });

                    setTimeout(() => {
                        if (this.environment.shouldShowPatientQueue && this.patient.patient.medicalStateId) {
                          this.patientOversaleLimitService.check(this.patient.cart, this.patient.patient, this.store)
                              .take(1).subscribe((oversale) => {
                                  console.log("[AFTER CART RESTORE] Got patient oversale limit value: ", oversale);
                                  this.oversaleError = oversale;
                                  if (oversale) {
                                      this.cartService.showPatientOversaleLimitModal();
                                  }
                              });
                          }
                    }, 2000);
                });
            }
        });

        // this.customDiscounts = [];

        this.userEmittedSubscription = this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted
            .subscribe(store => {
                console.log(store);
                this.store = store;
            });

        this.drawerService.getCurrent(false, localStorage.getItem('deviceId')).take(1).subscribe(drawer => {
            console.log("Get current in POS cart");
            console.log(drawer);
            this.drawer = drawer
        });

        this.currentCartEmittedSubscription = this.cartService.currentCartEmitted
            .flatMap(async cart => {
                if(cart) {
                    await Bluebird.map(cart.lineItems, lineItem => {
                        if(!lineItem.fromBarcode){
                            return Bluebird.map(lineItem.Transactions, transaction => {
                                if(!transaction.packageSelect2Options){
                                    return CommonAdapter(this.packageService, 'id', 'Label', {itemId: transaction.itemId, inStock: true})
                                        .then(adapter => {
                                            transaction.packageSelect2Options = {
                                                ajax: {},
                                                placeholder: 'Select Package',
                                            };
                                            transaction.packageSelect2Options['dataAdapter'] = adapter;
                                        })
                                }
                            })
                        }
                    });
                }

                return cart;
            })
            .switchMap(cart => {
                return this.cartService.calculateLineItemPrices(cart)
                    .map(cart => {
                        return cart;
                    })
            })
            .switchMap(cart => {
                return Observable.combineLatest(
                    this.manualDiscountEmitted.take(1), //TODO not used anymore, is just customDiscount
                    this.customDiscountEmitted.take(1),
                    this.loyaltyRewardEmitted.take(1),
                    (manualDiscounts, customDiscounts, loyaltyReward) => {
                        console.log("Projection");
                        let loyaltyDiscounts;
                        if(loyaltyReward){
                            //Do above logic here
                            loyaltyDiscounts = this.loyaltyRewardService.calculateLoyaltyRewardDiscount(loyaltyReward, cart, this.store);
                            console.log(loyaltyDiscounts)
                        }else{
                            loyaltyDiscounts = [];
                        }

                        if(!customDiscounts){
                            customDiscounts = [];
                        }

                        return {manualDiscounts, customDiscounts, loyaltyDiscounts, cart}
                    }
                )
            })
            .switchMap(({cart, manualDiscounts, customDiscounts, loyaltyDiscounts}) => {
                return this.discountService.active(cart, manualDiscounts, customDiscounts, loyaltyDiscounts)
                    .map(() => {
                        console.log("Returned from discount service");
                        console.log(cart);
                        return cart;
                    });
            })
            .switchMap(cart => {
                if (this.environment.shouldShowPatientQueue) {
                  return this.patientOversaleLimitService.check(this.patient.cart, this.patient.patient, this.store)
                      .map((oversale) => {
                          console.log("Got patient oversale limit value: ", oversale);
                          this.oversaleError = oversale;
                          if (oversale) {
                              this.cartService.showPatientOversaleLimitModal();
                          }
                          return cart;
                      });
                } else {
                  return this.storeOversaleLimitService.check(cart, this.store)
                      .map((oversale) => {
                          console.log("Got store oversale limit value: ", oversale);
                          this.oversaleError = oversale;
                          if (oversale) {
                              this.cartService.showOversaleLimitModal();
                          }
                          return cart;
                      });
                }
            })
            // .map(cart =>{
            //
            //     let options = [];
            //
            //     for(let lineItem of cart.lineItems){
            //         options.push({
            //             text: lineItem.Product.name + ' ' + lineItem.ProductVariation.name,
            //             id: lineItem.id
            //         });
            //     }
            //
            //     console.log("Called!");
            //     console.log(options);
            //     console.log(this.lineItemSelect2Options['dataAdapter']);
            //     this.lineItemSelect2Options['dataAdapter'].setArrayData(options);
            //     console.log(this.lineItemSelect2Options);
            //
            //     return cart;
            // })
            .map(cart => {

                if (environment.wholeDollarPricing) {
                    const originalTotal = +(cart.total).toFixed(2); // could be = cart.total - cart.discountAmount - cart.returnAmount
                    const originalTotalDecimals = +(originalTotal % 1).toFixed(2);
                    console.log("originalTotal", originalTotal, "originalTotalDecimals", originalTotalDecimals);
                    if (originalTotal > 1 && originalTotalDecimals > 0) {
                        cart.lineItems.map( lineItem => {
                            lineItem['proportionalPercentage'] = +((lineItem.price * 100) / originalTotal).toFixed(2);
                        });
                        cart.lineItems.map( lineItem => {
                            lineItem['proportionalDiffAmount'] = +((lineItem['proportionalPercentage'] * originalTotalDecimals) / 100).toFixed(2);
                            console.log("lineitem price", lineItem.price,
                            "proportionalPercentage", lineItem['proportionalPercentage'],
                            "proportionalDiffAmount", lineItem['proportionalDiffAmount']);
                        });
                        cart.lineItems.map( lineItem => {
                            if (!lineItem.isReturn) {
                                lineItem.price -= lineItem['proportionalDiffAmount'];
                                lineItem.Transactions.forEach( transaction => {
                                    transaction.TotalPrice -= lineItem['proportionalDiffAmount'];
                                });
                            }
                        });
                    }
                }

                return cart;
            })
            .map(cart => {

                this.cartService.clearTax(cart);

                this.cartService.calculateTax(cart);

                return cart;
            })
            .map(cart => {

                //TODO should do wholesale check here, but package isn't available without barcode
                //TODO: Who knows what the above TODO is saying, going to reset error flags here
                this.cartPriceTooLow = false;

                return cart;
            })
            .subscribe(cart => {
                if(this.patient) {
                    this.patient.cart = cart;

                    this.cartService.saveCart(this.patient, undefined, true);
                }
            });

        Observable.combineLatest(
            this.manualDiscountEmitted,
            this.customDiscountEmitted,
            this.loyaltyRewardEmitted,
            this.discountRefreshEmitted
        ).subscribe(() => {
            this.cartService.updateCart();
        });

        this.customDiscountEmittedSubscription =  this.cartService.customDiscountEmitted.subscribe(discounts => {
            if(discounts && discounts.length){
                if(environment.managerApprovalForCustomDiscounts) {
                    this.cartService.showManagerApprovalModal();
                    this.customManagerApprovalSubscription = this.cartService.managerApprovalEmitted.subscribe(approved => {
                        if (approved) {
                            for (let discount of discounts) {
                                this.discountService.save(discount, false);
                                this.customDiscounts.push(discount);
                            }
                            this.customDiscountSource.next(this.customDiscounts);
                        }
                    });
                }else{

                    for (let discount of discounts) {
                        this.discountService.save(discount, false);
                        this.customDiscounts.push(discount);
                    }
                    this.customDiscountSource.next(this.customDiscounts);

                }
            }

        })

        this.secondsTotal = this.patient.cart.timerSeconds;
        this.secondsString = this.padTimerValues(this.secondsTotal%60);
        this.minutesString = this.padTimerValues(Math.floor(this.secondsTotal/60));

        //Start timer
        this.timerIntervalId = setInterval(() => {
            this.secondsTotal++;
            this.secondsString = this.padTimerValues(this.secondsTotal%60);
            this.minutesString = this.padTimerValues(Math.floor(this.secondsTotal/60));
            this.patient.cart.timerSeconds = this.secondsTotal;
        }, 1000);

        CommonAdapter(this.discountService, 'id', (discount) => `${discount.name}: ${discount.amountType == 'dollar' ? '$' : ''}${discount.amount}${discount.amountType == 'percent' ? '%' : ''}`, {hasCode: true, status: 'on'})
            .then(adapter => {
                let discountSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Discount Code',
                    allowClear: true
                };
                discountSelect2Options['dataAdapter'] = adapter;

                this.discountCodeSelect2Options = discountSelect2Options;
            });

        this.loyaltyDiscountFilters.maxPoints = this.patient.patient.loyaltyPoints;

        CommonAdapter(
            this.loyaltyRewardService,
            'id', (discount) => `${discount.name}: ${discount.discountAmountType == 'dollar' ? '$' : ''}${discount.discountAmount}${discount.discountAmountType == 'percent' ? '%' : ''} ${discount.points} points`,
            this.loyaltyDiscountFilters
        )
            .then(adapter => {
                let loyaltyDiscountSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Loyalty Reward',
                };
                loyaltyDiscountSelect2Options['dataAdapter'] = adapter;

                this.loyaltyDiscountSelect2Options = loyaltyDiscountSelect2Options;
            });

        this.stateOptions = {
            data: [ { id: 'CO', text: 'CO' },
                { id: 'AL', text: 'AL' },
                { id: 'AK', text: 'AK' },
                { id: 'AZ', text: 'AZ' },
                { id: 'AR', text: 'AR' },
                { id: 'CA', text: 'CA' },
                { id: 'CT', text: 'CT' },
                { id: 'DE', text: 'DE' },
                { id: 'DC', text: 'DC' },
                { id: 'FL', text: 'FL' },
                { id: 'GA', text: 'GA' },
                { id: 'HI', text: 'HI' },
                { id: 'ID', text: 'ID' },
                { id: 'IL', text: 'IL' },
                { id: 'IN', text: 'IN' },
                { id: 'IA', text: 'IA' },
                { id: 'KS', text: 'KS' },
                { id: 'KY', text: 'KY' },
                { id: 'LA', text: 'LA' },
                { id: 'ME', text: 'ME' },
                { id: 'MD', text: 'MD' },
                { id: 'MA', text: 'MA' },
                { id: 'MI', text: 'MI' },
                { id: 'MN', text: 'MN' },
                { id: 'MS', text: 'MS' },
                { id: 'MO', text: 'MO' },
                { id: 'MT', text: 'MT' },
                { id: 'NE', text: 'NE' },
                { id: 'NV', text: 'NV' },
                { id: 'NH', text: 'NH' },
                { id: 'NJ', text: 'NJ' },
                { id: 'NM', text: 'NM' },
                { id: 'NY', text: 'NY' },
                { id: 'NC', text: 'NC' },
                { id: 'ND', text: 'ND' },
                { id: 'OH', text: 'OH' },
                { id: 'OK', text: 'OK' },
                { id: 'OR', text: 'OR' },
                { id: 'PA', text: 'PA' },
                { id: 'RI', text: 'RI' },
                { id: 'SC', text: 'SC' },
                { id: 'SD', text: 'SD' },
                { id: 'TN', text: 'TN' },
                { id: 'TX', text: 'TX' },
                { id: 'UT', text: 'UT' },
                { id: 'VT', text: 'VT' },
                { id: 'VA', text: 'VA' },
                { id: 'WA', text: 'WA' },
                { id: 'WV', text: 'WV' },
                { id: 'WI', text: 'WI' },
                { id: 'WY', text: 'WY' } ]
        };

        this.cartPinEntryResultSubscription = this.cartService.pinEntryResult.subscribe((result) => {
            if(result){
                this.cartService.hidePinEntryModal();

                this.goToDone();
            } else {
                console.log("incorrect pin");
            }
        });
    }

    ngOnDestroy(){
        clearInterval(this.timerIntervalId);

        this.userEmittedSubscription && this.userEmittedSubscription.unsubscribe();
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
        this.currentCartEmittedSubscription && this.currentCartEmittedSubscription.unsubscribe();
        this.manualDiscountSubscription && this.manualDiscountSubscription.unsubscribe();
        this.managerApprovalSubscription && this.managerApprovalSubscription.unsubscribe();
        this.customManagerApprovalSubscription && this.customManagerApprovalSubscription.unsubscribe();
        this.customDiscountEmittedSubscription && this.customDiscountEmittedSubscription.unsubscribe();
        this.cartPinEntryResultSubscription && this.cartPinEntryResultSubscription.unsubscribe();

        this.renderer.removeClass(document.body, 'pos-cart-open');
    }

    viewProduct(metrcPackage: IProductVariation){
        // this.cartService.viewProduct(metrcPackage);
    }

    clearProduct(lineItem: ILineItem) {
        const finishPatient = this.cartService.removeFromCart(lineItem);

        if(finishPatient) {
            this.clearCartDetails();
            this.cartService.clearSavedCart(this.patient);
            this.finishPatient.emit(this.patient);
        }
    }

    goToCheckout() {

        if(!this.patient.cart.lineItems.length){
            return;
        }

        let checkOversale;

        if (this.environment.shouldShowPatientQueue && this.patient.patient.medicalStateId) {
            checkOversale = new Promise(resolve => {
                this.patientOversaleLimitService.check(this.patient.cart, this.patient.patient, this.store)
                  .take(1).subscribe((oversale) => {
                      console.log("[BEFORE PURCHASE] Got patient oversale limit value: ", oversale);
                      this.oversaleError = oversale;
                      if (oversale) {
                          this.cartService.showPatientOversaleLimitModal();
                          return resolve(false);
                      }

                      return resolve(true);
                  });
            })
        } else {
            // Just a dummy promise
            checkOversale = new Promise(resolve => setTimeout(() => resolve(true), 1));
        }

        checkOversale.then(canProceed => {

            if (canProceed) {
                //Check that packages are set
                const confirmed = this.cartService.confirmTransactionsHavePackages();

                if(!this.patient.cart.lineItems.length){
                    return;
                }

                if(!confirmed) {
                    this.packageErrors = true;
                    return;
                }

                const enoughProductInPackage = this.cartService.confirmPackagesContainEnoughProductQuantity();

                if(enoughProductInPackage !== true ) {
                    this.packageErrors = false;
                    this.packageQuantityError = true;
                    this.packageQuantityErrorMessage = enoughProductInPackage;
                    return;
                } else {
                    this.packageQuantityError = false;
                }

                if(!environment.canCheckoutUnderWholesale) {
                    let totalWholesale = 0;
                    let totalPrice = 0;
                    let itemCount = 0;
                    // let totalPrice = this.cart.total - this.cart.discountAmount;
                    //TODO: This was changed -- wholesale check is pretax

                    for(let lineItem of this.patient.cart.lineItems) {
                        //Only check cannabis for wholesale price
                        if(lineItem.Product.ProductType.category == 'cannabis' && !lineItem.isReturn){
                            console.log(`[WHOLESALE] - Adding $${lineItem.wholesalePrice} to total wholesale`);
                            totalWholesale += lineItem.wholesalePrice;
                            console.log(`[WHOLESALE] - Price: ${lineItem.price} | Discount: ${lineItem.discountAmount}`);
                            totalPrice += (lineItem.price - lineItem.discountAmount);
                            console.log(`[WHOLESALE] - Item Count ${lineItem.quantity}`);
                            itemCount += lineItem.quantity;
                        }
                    }

                    console.log(`[WHOLESALE] - Total Wholesale: ${totalWholesale} | Total Price: ${totalPrice}`);

                    // console.log({totalWholesale, totalPrice});

                    //If total price is 0, cannot checkout
                    //If wholesale - price is greater than 0.01 (means entire cart sum is below wholesale)
                    //If wholesale is 0 and total price is somewhere between 0 and 0.02 and there is more than one item in the cart means that it can't be rebalanced
                    console.log(`totalPrice == 0: ${totalPrice == 0}`);
                    console.log(`totalWholesale - totalPrice > 0.01: ${totalWholesale - totalPrice > 0.01}`);
                    console.log(`totalWholesale == 0 && totalPrice < 0.02 && this.patient.cart.lineItems.length > 1: ${totalWholesale == 0 && totalPrice < 0.02 && itemCount > 1}`);
                    if(totalPrice == 0 && itemCount > 0 || totalWholesale - totalPrice > 0.01 || (totalWholesale == 0 && totalPrice < 0.02 && itemCount > 1)) {
                        this.cartPriceTooLow = true;
                        return;
                    }
                }

                const isOnlyReturns = this.cartService.isOnlyReturns();
                const isRefund = Boolean( this.patient.cart.total - this.patient.cart.discountAmount - this.patient.cart.returnAmount < 0 )

                if(isOnlyReturns) {
                    this.step = 'checkout';
                    this.onDone()
                } else {

                    if(environment.shouldShowAgeVerification){
                        this.cartService.showAgeVerificationModal();
                        this.cartService.ageVerifiedEmitted.subscribe(verified => {
                            if(verified){
                              if( isRefund ) { return this.onDone() }
                                this.step = 'checkout';
                                setTimeout(() => {
                                    this.cashInput.nativeElement.focus();
                                    this.cashInput.nativeElement.addEventListener('keypress', (evt) => {
                                        if (!evt.currentTarget.getAttribute('data-done') && evt.key === 'Enter'){
                                            evt.currentTarget.setAttribute('data-done', 1);
                                            this.onDone();
                                        }
                                    })
                                });
                            }
                        })
                    }else{
                        this.step = 'checkout';
                        if( isRefund ) { return this.onDone() }
                        setTimeout(() => {
                            this.cashInput.nativeElement.focus();
                            this.cashInput.nativeElement.addEventListener('keypress', (evt) => {
                                if (!evt.currentTarget.getAttribute('data-done') && evt.key === 'Enter'){
                                    evt.currentTarget.setAttribute('data-done', 1);
                                    this.onDone();
                                }
                            })
                        });
                    }
                }
            }
        });
    }

    onDone(){
        if(environment.shouldShowPinEntryUponCheckout) {
            this.cartService.showPinEntryModal();
        } else {
            this.goToDone();
        }
    }

    goToDone() {
        console.log('goToDone()');
        //Make sure amount paid is set
        this.notPaid = false;
        this.notEnough = false;
        this.missingGiftcardTransactionId = false;

        const enoughProductInPackage = this.cartService.confirmPackagesContainEnoughProductQuantity();

        if (enoughProductInPackage !== true ) {
            this.packageErrors = false;
            this.packageQuantityError = true;
            this.packageQuantityErrorMessage = enoughProductInPackage;
            return;
        } else {
            this.packageQuantityError = false;
        }

        if(this.paymentMethod == 'cash' && !this.amountPaid && this.cart.total - this.cart.discountAmount - this.cart.returnAmount > 0){
            this.notPaid = true;
            return;
        }
        if(this.paymentMethod == 'cash' && (this.cart.total - this.cart.discountAmount - this.cart.returnAmount) - this.amountPaid > 0.01){
            this.notEnough = true;
            return;
        }
        if(this.paymentMethod == 'gift-card' && !this.giftcardTransactionId) {
            this.missingGiftcardTransactionId = true;
            return;
        }

        if(this.paymentMethod == 'gift-card') {
            this.amountPaid = this.cart.total - this.cart.discountAmount - this.cart.returnAmount;
        }

        this.patient.patient.loyaltyPoints += Math.floor(this.cart.total - this.cart.discountAmount - this.cart.returnAmount);

        if(this.selectedLoyaltyDiscount) {
            this.patient.patient.loyaltyPoints -= this.selectedLoyaltyDiscount.points;
        }

        this.patientService.save(this.patient.patient, false, () => {
            this.cartService.submitCart((this.cartService.posUserId ? this.cartService.posUserId : this.user.id), this.paymentMethod, this.amountPaid, this.secondsTotal, this.patient.patient.id,
                (this.patient.caregiver ? this.patient.caregiver.id : null), this.drawer, this.giftcardTransactionId);
            // don't do this on error

            this.cartService.clearSavedCart(this.patient);
            this.clearCartDetails();

            this.finishPatient.emit(this.patient);
            this.step = 'cart';
        } )
    }

    calculatePackageQuantityEnough(){
        const enoughProductInPackage = this.cartService.confirmPackagesContainEnoughProductQuantity();

        if (enoughProductInPackage !== true ) {
            this.packageErrors = false;
            this.packageQuantityError = true;
            this.packageQuantityErrorMessage = enoughProductInPackage;
        } else {
            this.packageQuantityError = false;
        }
    }

    incrementQuantity(lineItem: ILineItem) {
        const result = this.cartService.incrementQuantity(lineItem);

        if( !result ) {
            this.returnIncrementError = 'Unable to return that many'
            this.returnIncrementErrorId = lineItem.id
        }

        if (this.patient) {
            this.cartService.saveCart(this.patient, undefined, true);
        }
    }

    decrementQuantity(lineItem: ILineItem) {
        this.returnIncrementError = '';
        this.returnIncrementErrorId = '';
        this.cartService.decrementQuantity(lineItem);

        if (this.patient) {
            this.cartService.saveCart(this.patient, undefined, true);
        }

        this.calculatePackageQuantityEnough();
    }

    saveCart(){
        this.cartService.releasePatientFromBudtender(this.patient, () => {
            this.cartService.saveCart(this.patient);
            this.savePatient.emit(this.patient);
        });
    }

    clearAndCloseCart() {
        this.cartService.releasePatientFromBudtender(this.patient, () => {
            this.clearCartDetails();
            this.cartService.clearSavedCart(this.patient);
            this.finishPatient.emit(this.patient);
        });
    }

    viewPurchaseHistory(){
        this.patientService.showPreviousPurchasesModal(this.patient.patient, "Cart");
    }

    viewPatientNotes(){
        this.patientService.showPatientNotesModal(this.patient.patient, 'Cart');
    }

    clearCartDetails(){
        this.cartService.setCart(this.cartService.newInstance());
        this.step = 'cart';
        this.paymentMethod = 'cash';
        this.amountPaid = undefined;
        this.giftcardTransactionId = undefined;

        this.selectedDiscountId = undefined;
        this.selectedLoyaltyDiscountId = undefined;
        this.selectedLoyaltyDiscount = undefined;

        this.manualDiscountSource.next(undefined);
        this.customDiscountSource.next(undefined);
        this.loyaltyRewardSource.next(undefined);
        this.cartService.emitCustomDiscount(undefined);
    }

    updateLineItemPackageId(transaction, packageId) {
        this.packageService.get(packageId)
            .take(1)
            .subscribe(_package => {
                transaction.Package = _package;
                transaction.packageId = _package.id;

                this.cartService.refreshCart();
            })
    }

    manualDiscount() {
        if (this.selectedDiscountId) {
            //Get the discount associated with this code
            this.manualDiscountSubscription = this.discountService.getAssociated(this.selectedDiscountId).subscribe(discount => {
                console.log("Discount from service");
                console.log(discount);
                this.selectedDiscountId = undefined;

                if(discount.managerApproval){
                    //Modal
                    this.cartService.showManagerApprovalModal();
                    this.managerApprovalSubscription = this.cartService.managerApprovalEmitted.subscribe(approved => {
                        console.log("Approval emitted: ", approved);
                        if(approved){
                            this.customDiscounts.push(discount);
                            this.customDiscountSource.next(this.customDiscounts);
                        }
                    })
                }else{
                    this.customDiscounts.push(discount);
                    this.customDiscountSource.next(this.customDiscounts);
                }
            });
        }
    }

    loyaltyDiscount() {
        if(this.selectedLoyaltyDiscountId) {

            this.loyaltyRewardService.getAssociated(this.selectedLoyaltyDiscountId).subscribe(loyaltyReward => {
                this.selectedLoyaltyDiscount = loyaltyReward;
                console.log(loyaltyReward);
                this.loyaltyRewardSource.next(loyaltyReward);
            })
        }
    }

    async saveCustomer(){
        this.loyalty = false;

        if(this.patient.patient.emailAddress){
            let validEmail = await this.userService.validateEmail(this.patient.patient.emailAddress);
            if( validEmail ) {
                let patient = await this.patientService.findByIdentifier(this.patient.patient.emailAddress).take(1).toPromise()
                if( patient ) {
                    this.patient.patient = patient;
                    this.loyaltyDiscountFilters.maxPoints = this.patient.patient.loyaltyPoints;
                    return;
                }
            }
        }

        this.patientService.save(this.patient.patient, false);
    }

    toggleLoyalty() {
        if(this.loyalty){
            this.loyalty = false;
        }else{
            this.loyalty = true;
        }
    }
    public loyalty = false;


    toggleCustomDiscount() {
        // if(this.customDiscountLink){
        //     this.customDiscountLink = false;
        // }else{
        //     this.customDiscountLink = true;
        // }
        this.cartService.showCustomDiscountModal();
    }
    public customDiscountLink = false;


    toggleLoyaltyDiscount() {
        if(this.loyaltyDiscountLink){
            this.loyaltyDiscountLink = false;
        }else{
            this.loyaltyDiscountLink = true;
        }
    }
    public loyaltyDiscountLink = false;


    toggleManagerOverrideDiscount(){
        this.managerOverrideLink = !this.managerOverrideLink;
    }

    public managerOverrideLink = false;

    toggleManagerOverrideDiscountType(value){
        this.managerOverrideDiscountTypePercent = value;
    }

    public managerOverrideDiscountTypePercent = false;

    managerOverrideDiscount(value: number | string) {
        if(typeof value == 'string'){
            value = parseFloat(value);
        }
        let amountType = "dollar";
        if(this.managerOverrideDiscountTypePercent){
            amountType = "percent";
        }else{
            //If dollar amount, divide total discount amount by number of line items
            let numLineItems = this.cart.lineItems.length;
            value = value / numLineItems;
        }

        let discount = new Discount({
            id: uuid.v4(),
            version: 0,

            name: 'Manager Override',
            code: undefined,

            amountType: amountType,
            amount: value,

            minimumType: 'items',
            minimum: 0,

            maximum: undefined,

            startDate: null,
            endDate: null,

            startTime: null,
            endTime: null,

            days: [],
            patientType: 'all',
            patientGroupId: undefined,
            productTypeId: undefined,
            productId: undefined,
            packageId: undefined,
            productVariationId: undefined,
            lineItemId: undefined,
            supplierId: undefined,
            isActive: true,
            isAutomatic: true,
            isCustom: true,
            isOverride: true,
            managerApproval: false,
            thcType: 'all',
            notes: ''
        });

        this.cartService.showManagerApprovalModal();
        this.customManagerApprovalSubscription = this.cartService.managerApprovalEmitted.subscribe(approved => {
            if(approved){
                this.discountService.save(discount, false);

                //Uncomment this if all other custom discounts should be removed when this is applied
                this.customDiscounts = [];

                this.customDiscounts.push(discount);
                this.customDiscountSource.next(this.customDiscounts);
            }
        });


    }


    toggleCustomDiscountTypePercent(value) {
        this.customDiscountTypePercent = value;
        console.log(this.customDiscountTypePercent);
    }
    public customDiscountTypePercent = false;

    punchCardLineItemSelected(){
        if(this.selectedLineItemId){

            let selectedLineItem;

            for(let lineItem of this.cart.lineItems){
                if(lineItem.id == this.selectedLineItemId){
                    selectedLineItem = lineItem;
                }
            }

            let value = (selectedLineItem.price / selectedLineItem.quantity) - 0.01;

            let discount = new Discount({
                id: uuid.v4(),
                version: 0,

                name: 'Punch Card Discount',
                code: undefined,

                amountType: 'dollar',
                amount: value,

                minimumType: 'items',
                minimum: 0,

                maximum: undefined,

                startDate: null,
                endDate: null,

                startTime: null,
                endTime: null,

                days: [],
                patientType: 'all',
                patientGroupId: undefined,
                productTypeId: undefined,
                productId: undefined,
                packageId: undefined,
                productVariationId: undefined,
                lineItemId: this.selectedLineItemId,
                supplierId: undefined,
                isActive: true,
                isAutomatic: true,
                isCustom: true,
                isOverride: true,
                managerApproval: false,
                thcType: 'all',
                notes: ''
            });

            this.discountService.save(discount, false);

            this.customDiscounts.push(discount);

            this.customDiscountSource.next(this.customDiscounts);
        }
    }

    togglePunchCardDiscount(){
        this.punchCardLink = !this.punchCardLink;

        if(this.punchCardLink){
            let options = [];
            for(let lineItem of this.cart.lineItems){
                options.push({
                    text: lineItem.Product.name + ' ' + lineItem.ProductVariation.name,
                    id: lineItem.id
                });
            }
            this.lineItemSelect2Options.data = options;
        }
    }

    public punchCardLink = false;

    refundPreviousPurchase() {
        this.cartService.refundPreviousPurchase()
    }

    customDiscount(value: number | string) {
        // if(typeof value == 'string'){
        //     value = parseFloat(value);
        // }
        // let amountType = "dollar";
        // if(this.customDiscountTypePercent){
        //     amountType = "percent";
        // }else{
        //     //If dollar amount, divide total discount amount by number of line items
        //     let numLineItems = this.cart.lineItems.length;
        //     value = value / numLineItems;
        // }
        //
        // let discount = new Discount({
        //     id: uuid.v4(),
        //     version: 0,
        //
        //     name: 'Custom Discount',
        //     code: undefined,
        //
        //     amountType: amountType,
        //     amount: value,
        //
        //     minimumType: 'items',
        //     minimum: 0,
        //
        //     maximum: undefined,
        //
        //     startDate: null,
        //     endDate: null,
        //
        //     startTime: null,
        //     endTime: null,
        //
        //     days: [],
        //     patientType: 'all',
        //     patientGroupId: undefined,
        //     productTypeId: undefined,
        //     productId: undefined,
        //     packageId: undefined,
        //     productVariationId: undefined,
        //     lineItemId: undefined,
        //     isActive: true,
        //     isAutomatic: true,
        //     isCustom: true,
        //     isOverride: false,
        //     managerApproval: false,
        //     thcType: 'all'
        // });
        //
        // this.cartService.showManagerApprovalModal();
        // this.customManagerApprovalSubscription = this.cartService.managerApprovalEmitted.subscribe(approved => {
        //     if(approved){
        //         this.discountService.save(discount, false);
        //
        //         //Uncomment this if all other custom discounts should be removed when this is applied
        //         this.customDiscounts = [];
        //
        //         this.customDiscounts.push(discount);
        //         this.customDiscountSource.next(this.customDiscounts);
        //     }
        // });


    }

    padTimerValues(value: number){
        let valueString = value + "";

        if(valueString.length < 2){
            return "0" + valueString;
        }else{
            return valueString;
        }
    }

    changeDue() {
        const amountPaid = this.amountPaid || 0

        return `$${Math.abs(amountPaid - (this.cart.total - this.cart.discountAmount - this.cart.returnAmount)).toFixed(2)}`
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

    removeLineItemDiscount(lineItem: ILineItem) {

        if (!lineItem.skipDiscountInPOSCart) {
            lineItem.skipDiscountInPOSCart = [];
        }

        // You can skip only one manual discount per line item
        // if (!lineItem.Discount.isAutomatic) {
        //     lineItem.skipDiscountInPOSCart = lineItem.skipDiscountInPOSCart.filter(discount => discount.isAutomatic);
        // }

        lineItem.skipDiscountInPOSCart.push({
            discountId: lineItem.Discount.id,
            isAutomatic: lineItem.Discount.isAutomatic
        });

        let cartHasLineItemWithDiscount = false;

        lineItem.discountAmount = 0;
        lineItem.Discount = undefined;
        lineItem.discountId = undefined;

        for (const transaction of lineItem.Transactions) {
            transaction.discountAmount = 0;
            transaction.discountId = undefined;
        }

        for (let i = 0; i < this.cart.lineItems.length; i++) {
            if (this.cart.lineItems[i].discountId) {
                cartHasLineItemWithDiscount = true;
                break;
            }
        }

        // console.log('lineItem', lineItem);
        // console.log('lineItem.skipDiscountInPOSCart', lineItem.skipDiscountInPOSCart);
        // console.log('cartHasLineItemWithDiscount', cartHasLineItemWithDiscount);

        // If there are no more lineItems with discount - ensure that it's removed from the cart itself
        if (!cartHasLineItemWithDiscount) {
            this.removeAllCartDiscountsExceptAutomatic();

            for (let i = 0; i < this.cart.lineItems.length; i++) {
                if (this.cart.lineItems[i].skipDiscountInPOSCart) {
                    this.cart.lineItems[i].skipDiscountInPOSCart = this.cart.lineItems[i].skipDiscountInPOSCart.filter(discount => discount.isAutomatic);
                }
            }

        } else {
            this.discountRefreshSource.next(undefined);
        }
    }

    removeAllCartDiscountsExceptAutomatic() {
        this.selectedDiscountId = undefined;
        this.selectedLoyaltyDiscountId = undefined;
        this.selectedLoyaltyDiscount = undefined;

        this.manualDiscountSource.next(undefined);
        this.customDiscountSource.next(undefined);
        this.loyaltyRewardSource.next(undefined);
        this.cartService.emitCustomDiscount(undefined);

        this.customDiscounts = [];
        const opts = Object.assign({}, this.discountCodeSelect2Options);
        this.discountCodeSelect2Options = undefined;

        setTimeout(()=>{
            this.discountCodeSelect2Options = opts;
        }, 100);
    }

    assignToPatientGroup() {
        this.cartService.showAssignPatientToPatientGroupModal(this.patient.patient);
    }
}
