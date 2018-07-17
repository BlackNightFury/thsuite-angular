import {Component, OnInit, AfterViewInit } from "@angular/core";
import {Observable, BehaviorSubject, Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {IProductVariation} from "../../models/interfaces/product-variation.interface";
import {IPackage} from "../../models/interfaces/package.interface";
import {BarcodeService} from "app/services/barcode.service";
import {ProductVariationService} from "app/services/product-variation.service";
import {CommonAdapter} from "../../util/select2-adapters/common-adapter";
import {SupplierService} from "../../services/supplier.service";
import {ProductTypeService} from "../../services/product-type.service";
import {PackageService} from "../../services/package.service";
import {ProductService} from "../../services/product.service";
import {ISupplier} from "../../models/interfaces/supplier.interface";
import {ObjectObservable} from "../../lib/object-observable";

import {IUser} from "../../models/interfaces/user.interface";
import {Cart} from "../../models/cart.model";

import {PosCartService} from "../../services/pos-cart.service";
import {UserService} from "../../services/user.service";
import {DrawerService} from "../../services/drawer.service";
import {StoreService} from "../../services/store.service";

import {environment} from '../../../environments/environment';
import {IDrawer} from "../../models/interfaces/drawer.interface";

@Component({
    selector: 'app-pos-list',
    templateUrl: './pos-list.component.html',
    styleUrls: ['./pos-list.component.css']
})
export class PosListComponent implements OnInit {

    listView = false;
    detailModalShowing = false;

    lowInventoryPackage: IPackage;
    aboveDrawerLimit: boolean;

    detailProduct: IProductVariation;
    savedCartView = false;

    productVariationPrices = {};

    savedCarts: Cart[];
    private drawer: IDrawer;


    private searchTerms = new BehaviorSubject<string>('');
    private page = new BehaviorSubject<number>(0);

    productVariations: IProductVariation[];
    // productVariations: Observable<IProductVariation>[];
    numPages: number;

    productTypeSelect2Options : Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options : Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    _page: number = 0;
    get pageModel(): number {
        return this._page;
    }
    set pageModel(value: number) {
        this._page = value;
        this.page.next(value);
    }

    lowInventorySubscription: Subscription;
    drawerLimitReachedSubscription: Subscription;

    drawerServiceSubscription: Subscription;
    storeServiceSubscription: Subscription;

    user: IUser;

    constructor(
        private productVariationService: ProductVariationService,
        private packageService: PackageService,
        private cartService: PosCartService,
        private route: ActivatedRoute,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        private userService: UserService,
        private barcodeService: BarcodeService,
        private drawerService: DrawerService,
        private storeService: StoreService
    ) {}

    barcodeSearch( input ) {
        this.barcodeService.getByBarcodeString(input.value.trim()).subscribe(barcodeObservable => {
            barcodeObservable.subscribe(barcode => {
                if(!barcode) return
                let packages = barcode.Packages;
                let productVariation = barcode.ProductVariation;

                this.cartService.addProductVariationToCart(productVariation, packages, barcode.id);
                input.value = ''
            })
        })
    }

    ngAfterViewInit() {
        const barcodeInput = (<HTMLInputElement>document.getElementById("scanBarcode"));

    		Observable.fromEvent(barcodeInput , 'keyup').debounceTime(200).subscribe( res => {
    			this.barcodeService.getByBarcodeString(barcodeInput.value.trim()).subscribe(barcodeObservable => {
    			    if(barcodeObservable){
                        barcodeObservable.take(1).subscribe(barcode => {
                            if(!barcode) return
                            let packages = barcode.Packages;
                            let productVariation = barcode.ProductVariation;

                            console.log("From barcode input");
                            if(productVariation.isBulkFlower && environment.bulkFlowerMode){
                                console.log("BULK FLOWER");
                                this.cartService.emitBulkFlowerInformation({productVariation, packages, barcode});
                                this.cartService.showBulkFlowerModal();
                            }else{
                                this.cartService.addProductVariationToCart(productVariation, packages, barcode.id);
                            }

                            barcodeInput.value = ''
                        });
                    }
    			})
    		});

        /*
        if (!this.aboveDrawerLimit && !this.drawerServiceSubscription && !this.storeServiceSubscription) {
            this.drawerServiceSubscription = this.drawerService.getCurrent(false, localStorage.getItem('deviceId')).take(1).subscribe(drawer => {
                this.storeServiceSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
                    console.log("WE LIT");
                    if (drawer.currentBalance > store.settings.drawerAmountForAlert) {
                        this.drawerService.settingDrawerLimitCheck(true);
                    }
                    this.drawerServiceSubscription.unsubscribe();
                    this.storeServiceSubscription.unsubscribe();
                });
            });
        }
        */
    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.cartService.savedCartsEmitted
            .subscribe(savedCarts => {
                this.savedCarts = savedCarts;
            });

        this.cartService.currentCartEmitted
            .subscribe(cart => {
                this.savedCartView = false;
            });

        if (!this.lowInventorySubscription) {
            this.lowInventorySubscription = this.packageService.lowInventoryPackageEmitted
                .subscribe(_package => {
                    console.log('Low inventory package', _package)
                    this.lowInventoryPackage = _package;
                });
        }

        console.log("drawer limit?");
        if (!this.drawerLimitReachedSubscription){
            this.drawerLimitReachedSubscription = this.drawerService.drawerLimitReachedCheckEmitted
                .subscribe( result => {
                    console.log("Result: " + result);
                    if (result !== undefined) {
                        this.aboveDrawerLimit = result;
                    }
                });
        }

        this.drawerService.getCurrent(true, localStorage.getItem('deviceId')).take(1).subscribe(drawer => {
            if (drawer) {
                this.storeService.currentStoreEmitted.subscribe(store => {
                    console.log("Updating in POS List OnInit");
                    if (store && store.settings.drawerAmountForAlert &&
                        drawer.currentBalance > store.settings.drawerAmountForAlert) {
                        console.log("DrawerAboveLimit");
                        this.drawerService.settingDrawerLimitCheck(true);
                    } else {
                        console.log("DrawerBelowLimit");
                        this.drawerService.settingDrawerLimitCheck(false);
                    }
                });
            }
        });

        let searchResponseObservable = Observable.combineLatest(
            this.searchTerms
                .debounceTime(300)
                .distinctUntilChanged()
                .do(() => this.page.next(0)),

            this.page
                .distinctUntilChanged(),

            this.route.params
                .distinctUntilChanged()
                .do(() => this.page.next(0)),

            this.selectedProductTypeIdSource
                .distinctUntilChanged()
                .do(() => this.page.next(0)),

            this.selectedProductIdSource
                .distinctUntilChanged()
                .do(() => this.page.next(0)),

            this.userService.userEmitted

        ).switchMap(([term, page, routeParams, productTypeId, productId, user]) => {
            return this.productVariationService.search(term, page, undefined, {
                cannabisCategory: routeParams['cannabisCategory'],
                productTypeId,
                productId,
                inStock: true,
                cannabis: user.Permissions.canManuallyAddCannabisItems,
                nonCannabis: user.Permissions.canManuallyAddNonCannabisItems
            })
        });

        searchResponseObservable.subscribe(
            (searchResult) => {
                // this.productVariations = Observable.combineLatest(searchResult.objects);

                this.productVariations = [];
                Observable.combineLatest(searchResult.objects).take(1).subscribe((productVariations) => {
                    console.log(productVariations);
                    for(let productVariation of productVariations){
                        let pricingTier = productVariation.Product.PricingTier;
                        if(pricingTier) {
                            let productWeight = productVariation.quantity;
                            let price = -1;
                            for (let tierWeight of pricingTier.PricingTierWeights) {
                                if (productWeight >= tierWeight.weight) {
                                    price = tierWeight.price;
                                }
                            }

                            productVariation.price = price;
                        }
                        this.productVariations.push(productVariation);
                    }
                });

                // this.productVariations = searchResult.objects;
                this.numPages = searchResult.totalPages;
            }
        );

        this.cartService.savedCartsToggleEmitted.subscribe(() => this.savedCartView = !this.savedCartView);


        this.cartService.productViewEmitted.subscribe(metrcPackage => {
            if(metrcPackage) {
                this.detailModalShowing = true;
                this.detailProduct = metrcPackage;
            }else{
                this.detailModalShowing = false;
            }

        });

        Observable.combineLatest(
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.productService, 'id', 'name'),
        ).toPromise()
            .then(([ProductTypeAdapter, ProductAdapter]) => {

                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];


                this.productSelect2Options = {
                    ajax: {},
                    placeholder: 'Product',
                    allowClear: true
                };
                this.productSelect2Options['dataAdapter'] = ProductAdapter;
                this.productSelect2InitialValue = [];

            });
    }

    search(term: string) {
        this.searchTerms.next(term);
    }

    goToPage(page: number) {
        this.page.next(page);
    }

    onAddToCart(productVariation: IProductVariation) {
        this.cartService.addProductVariationToCart(productVariation);
    }

    cancelViewProduct(){

        this.detailModalShowing = false;

    }

    private _selectedProductTypeId: string;
    get selectedProductTypeId() {
        return this._selectedProductTypeId;
    }
    set selectedProductTypeId(newValue: string) {
        this._selectedProductTypeId = newValue;
        this.selectedProductTypeIdSource.next(newValue);
    }

    private _selectedProductId: string;
    get selectedProductId() {
        return this._selectedProductId;
    }
    set selectedProductId(newValue: string) {
        this._selectedProductId = newValue;
        this.selectedProductIdSource.next(newValue);
    }

    private _viewOptions: 'grid'|'list' = 'grid';

    set viewOptions(value: 'grid'|'list') {
        this._viewOptions = value;
        //Update listView
        this.listView = (value == 'list');
    }

    get viewOptions() {
        return this._viewOptions;
    }

    isNavHidden = false;
    toggleNav() {
        this.isNavHidden = this.isNavHidden == true ? false : true;
    }
}
