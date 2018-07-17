import {Component, Injector, OnInit} from "@angular/core";
import {Subscription} from 'rxjs/Rx';
import {IPackage} from "../../../../models/interfaces/package.interface";
import {Observable} from "rxjs/Observable";
import {PackageService} from "../../../../services/package.service";
import {UserService} from "../../../../services/user.service";
import {IUser} from "../../../../models/interfaces/user.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PricingTierService} from "../../../../services/pricing-tier.service";
import {ProductTypeService} from "../../../../services/product-type.service";
import {ProductService} from "../../../../services/product.service";
import {SupplierService} from "../../../../services/supplier.service";
import {IProduct} from "../../../../models/interfaces/product.interface";
import {IProductVariation} from "../../../../models/interfaces/product-variation.interface";
import {ProductVariationService} from "../../../../services/product-variation.service";
import {AdjustmentService} from "../../../../services/adjustment.service";
import {PurchaseOrderService} from "../../../../services/purchase-order.service";
import {Adjustment} from "../../../../models/adjustment.model";
import {IAdjustment} from "../../../../models/interfaces/adjustment.interface";
import {IPurchaseOrder} from "../../../../models/interfaces/purchase-order.interface";
import {AdjustmentLog} from "../../../../models/adjustment-log.model";
import {IPackagePriceAdjustment} from "../../../../models/interfaces/package-price-adjustment.interface";
import {PackagePriceAdjustmentService} from "../../../../services/package-price-adjustment.service";
import {IReceiptAdjustment} from "../../../../models/interfaces/receipt-adjustment.interface";
import {ReceiptAdjustmentService} from "../../../../services/receipt-adjustment.service";
import {SalesReportService} from "../../../../services/report-services/sales-report.service";
import {IReceipt} from "../../../../models/interfaces/receipt.interface";
import {ObjectWithToggle} from "../../../../lib/object-with-toggle";
import * as moment from 'moment';
import * as formatCurrency from 'format-currency';
import {BarcodeService} from "../../../../services/barcode.service";
import {TransactionService} from "../../../../services/transaction.service";
import {IBarcode} from "../../../../models/interfaces/barcode.interface";
import {PrinterService} from "../../../../services/printer.service";
import {ItemService} from "../../../../services/item.service";
import {LineItemService} from "../../../../services/line-item.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {Product} from "../../../../models/product.model";
import {Barcode} from "../../../../models/barcode.model";
import {Package} from "../../../../models/package.model";
import {ProductVariation} from "../../../../models/product-variation.model";
import {ReceiptService} from "../../../../services/receipt.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AdjustmentReasonService} from "../../../../services/adjustment-reasons.service";
import {environment} from "../../../../../environments/environment";
import {PackageBarcodeNavigationService} from "../../../../services/package-barcode-navigation.service";
import {LabTestResultService} from "../../../../services/lab-test-result.service";
import {PrintBarcodeModalComponent} from "../../../../modals/print-barcode-modal/print-barcode-modal.component";
import {MdDialog} from "@angular/material";

declare const $: any;

@Component({
    selector: 'app-package-details',
    templateUrl: './package-details.component.html',
    styleUrls: ['./package-details.component.css']
})
export class PackageDetailsComponent implements OnInit{

    user: IUser;
    environment = environment;

    mode: string; // details' | 'product' | 'adjustments' | 'audit' | 'receipts' | 'barcodes';

    initializeMode(newValue){
        const fn = `initialize${newValue.charAt(0).toUpperCase() + newValue.slice(1)}Mode`;

        this[fn].apply(this, []);
    }

    modeChange(newMode){
        if(newMode && newMode.length) {
            this.packageService.detailView(this._package, newMode);
        }
    }

    packageObservable: Observable<IPackage>;
    _package: IPackage;
    product: IProduct;

    navToggleOptions = [
        {
            label: "Details",
            value: 'details'
        },
        {
            label: "Product Info",
            value: 'product'
        },
        {
            label: "Adjustments",
            value: 'adjustments'
        },
        {
            label: "Package Audit",
            value: 'audit'
        },
        {
            label: "Receipts",
            value: 'receipts'
        },
        {
            label: "Barcodes",
            value: 'barcodes'
        }
    ];

    supplierSelect2Options: Select2Options;

    productTypeSelect2Options: Select2Options;
    pricingTierSelect2Options: Select2Options;

    availableBarcodesSelect2Options: Select2Options = {
            placeholder: 'Select Barcode',
            data: []
    };

    packageSelect2Options: Select2Options;
    productVariationSelect2Options: Select2Options;

    editingReceiptByBarcode: boolean = false;
    editingReceiptManually: boolean = false;

    errorFlags: {
        supplierId: boolean;
        productTypeId: boolean;
        name: boolean;
        pricingTier: boolean;
        amount: boolean;
        reason: boolean;
    } = {
        supplierId: false,
        productTypeId: false,
        name: false,
        pricingTier: false,
        amount: false,
        reason: false
    };

    productErrors: string[];
    packageErrors: string[];
    adjustmentErrors: string[];

    productVariationsWithEdit = [];

    productSavedIndicator: boolean = false;

    adjustmentShowing: boolean = false;
    adjustmentOptions: Select2Options;

    purchaseOrderShowing: boolean = false
    purchaseOrder: IPurchaseOrder;

    // adjustmentOptions: Select2Options = {
    //     placeholder: 'Reason for Adjustment',
    //     data: [
    //         {
    //             id: 'API Adjustment Error ',
    //             text: 'API Adjustment Error '
    //         },
    //         {
    //             id: 'API Duplicate Sales Entry',
    //             text: 'API Duplicate Sales Entry'
    //         },
    //         {
    //             id: 'Drying',
    //             text: 'Drying'
    //         },
    //         {
    //             id: 'Entry Error',
    //             text: 'Entry Error'
    //         },
    //         {
    //             id: 'License to License Transfer',
    //             text: 'License to License Transfer'
    //         },
    //         {
    //             id: 'MMCC Inspector Obtained Product',
    //             text: 'MMCC Inspector Obtained Product'
    //         },
    //         {
    //             id: 'Plants Unpacked',
    //             text: 'Plants Unpacked'
    //         },
    //         {
    //             id: 'Scale Variance',
    //             text: 'Scale Variance'
    //         },
    //         {
    //             id: 'Spoilage',
    //             text: 'Spoilage'
    //         },
    //         {
    //             id: 'Theft',
    //             text: 'Theft'
    //         },
    //         {
    //             id: 'Waste',
    //             text: 'Waste'
    //         }
    //     ]
    // };

    adjustment: IAdjustment;

    priceAdjustmentShowing: boolean = false;

    priceAdjustment: IPackagePriceAdjustment;

    //THC Info
    cannabinoidTotal: number = 0;

    strainTypeOptions = [
        {
            label: "Indica",
            value: 'indica'
        },
        {
            label: "Sativa",
            value: 'sativa'
        },
        {
            label: "Hybrid",
            value: 'hybrid'
        },
        {
            label: "CBD",
            value: 'cbd'
        }
    ];

    editingTransaction: string = '';
    selectedPackageItemName: string = '';
    selectedProductVariationId: string = '';
    // productVariationSelect2SearchArgs: {id: string} = {id: undefined};

    public auditData: any[];

    public auditName: string;
    public auditUnits: string;

    protected router: Router;
    protected route: ActivatedRoute;

    public receipts: ObjectWithToggle<IReceipt>[];

    public barcodes: any[];

    private tempSubscription: Subscription;

    private toggledReceiptBarcode: string = '';

    public thcInformationAvailable = false;

    potencyUnitsToggleOptions = [
        {
            label: '%',
            value: '%'
        },
        {
            label: 'mg/ml',
            value: 'mg/ml'
        }
    ];

    get thcSum(){
        if(this._package.LabTestResult){
            return (this._package.LabTestResult.thc + this._package.LabTestResult.thcA).toFixed(3);
        }else{
            return '0.000';
        }
    }

    get cbdSum(){
        if(this._package.LabTestResult){
            return (this._package.LabTestResult.cbd + this._package.LabTestResult.cbdA + this._package.LabTestResult.cbg + this._package.LabTestResult.cbn + this._package.LabTestResult.cbgA).toFixed(3);
        }else{
            return '0.000';
        }
    }

    get cannabinoidSum(){
        return (parseFloat(this.thcSum) + parseFloat(this.cbdSum)).toFixed(3);
    }

    constructor(
        injector: Injector,
        private packageService: PackageService,
        private pricingTierService: PricingTierService,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        private supplierService: SupplierService,
        private barcodeService: BarcodeService,
        private productVariationService: ProductVariationService,
        private loadingBarService: SlimLoadingBarService,
        private itemService: ItemService,
        private adjustmentService: AdjustmentService,
        private purchaseOrderService: PurchaseOrderService,
        private packagePriceAdjustmentService: PackagePriceAdjustmentService,
        private receiptAdjustmentService: ReceiptAdjustmentService,
        private userService: UserService,
        private salesReportService: SalesReportService,
        private printerService: PrinterService,
        private lineItemService: LineItemService,
        private transactionService: TransactionService,
        private receiptService: ReceiptService,
        private adjustmentReasonService: AdjustmentReasonService,
        private packageBarcodeNavigationService: PackageBarcodeNavigationService,
        private labTestResultService: LabTestResultService,
        private dialog: MdDialog
    ) {
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit() {

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
            if (user.Permissions.canEditLineItems) {
                setTimeout(() => {
                    // Using this to get all barcodes because CommonAdapter doesn't work with BarcodeService
                    this.barcodeService.getAllBarcodesMap()
                        .subscribe(barcodes => {
                            this.availableBarcodesSelect2Options.data = barcodes.map(barcode => {
                                return {id: barcode.barcode, text: barcode.barcode};
                            });
                        });
                }, 500);
            }
        });

        this.adjustmentOptions = this.adjustmentReasonService.getAdjustmentReasons();

        Observable.combineLatest(
            CommonAdapter(this.supplierService, 'id','name'),
            CommonAdapter(this.pricingTierService, 'id', 'name'),
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.packageService, 'id', 'Label')
        ).toPromise()
            .then(([SupplierAdapter, PricingTierAdapter, ProductTypeAdapter, PackageAdapter]) => {
                this.supplierSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Supplier',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                }
                this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;

                this.pricingTierSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Pricing Tier',
                    allowClear: true
                };
                this.pricingTierSelect2Options['dataAdapter'] = PricingTierAdapter;

                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Product Type'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;

                this.packageSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Package'
                };
                this.packageSelect2Options['dataAdapter'] = PackageAdapter;
            });

        this.productVariationSelect2Options = {
            placeholder: 'Select Variation',
        };

        this.initializeDetailsMode();
    }

    initializeDetailsMode(){
        if (!this.packageObservable) {
            this.packageObservable = Observable.combineLatest(this.route.params, this.route.data)
                .map(([params, data]) => {

                    this.mode = params["mode"];

                    return params['id'];
                })
                .switchMap((id: string|undefined) => {
                    return id ? this.packageService.getAssociated(id, ['supplier', 'deliveryPackage', 'labTestResult']) : Observable.of(this.packageService.newInstance());
                });

            this.packageObservable.subscribe(object => {
                this._package = this.packageService.dbInstance(object);

                if(!this._package.LabTestResult){
                    this._package.LabTestResult = this.labTestResultService.newInstance();
                    this._package.LabTestResult.packageId = this._package.id;
                }

                if (!this._package.perUnitWholesalePrice) {
                    this._package.perUnitWholesalePrice = null;
                }

                this.updateCannabinoidTotal();

                //Get the product associated with this package
                this.productService.getByPackageId(this._package.id)
                    .subscribe(productObs => {
                        const sub = productObs.subscribe(product => {
                            this.product = new Product(product);
                            if (this.product.Item && !this.product.Item.thcWeight) {
                                this.product.Item.thcWeight = null;
                            }

                            const cannabisCategory = this.product.Item && this.product.Item.ProductType ? this.product.Item.ProductType.cannabisCategory.toLowerCase() : null;
                            this.thcInformationAvailable = !!(cannabisCategory === 'buds' || cannabisCategory === 'shaketrim' || environment.shouldShowLabResults);

                            this.productVariationsWithEdit = this.product.ProductVariations.map(productVariation => {
                                return {
                                    productVariation: new ProductVariation(productVariation),
                                    isEditing: false
                                }
                            });

                            this.initializeMode(this.mode);
                        });
                    });
            });
        }
    }

    initializeProductMode(){

        this.loadingBarService.interval = this._package.Adjustments ? 1 : 10;
        this.loadingBarService.start();

        var promises = new Array<Promise<IBarcode[]>>();

        this.productVariationsWithEdit.forEach((productVariation) => {

            var promise = this.barcodeService.getByProductVariationId(productVariation.productVariation.id).take(1).toPromise();

            promise.then((barcodes:IBarcode[]) => {
                var filteredBarcodes = [];

                var containsPackage = function(barcode, _package){
                    for(let p of barcode.Packages){
                        if(p.id == _package.id) {
                            return true;
                        }
                    }

                    return false;
                }

                for(let barcode of barcodes){
                    if(containsPackage(barcode, this._package)){
                        filteredBarcodes.push(barcode);
                    } 
                }

                productVariation.productVariation.Barcodes = filteredBarcodes;
            });

            promises.push(promise);
        });

        Promise.all(promises).then(() => {
            this.loadingBarService.complete();
        });
    }

    initializeAdjustmentsMode(){
        this.loadingBarService.interval = this._package.Adjustments ? 1 : 10;
        this.loadingBarService.start();

        const sub = this.packageService.resolveAssociations(this._package, ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments'])
            .subscribe(_package => {
                sub.unsubscribe();

                this._package = _package;

                this.adjustment = this.adjustmentService.newInstance();
                this.purchaseOrder = this.purchaseOrderService.newInstance();
                this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();

                this.adjustment.packageId = this._package.id;
                this.purchaseOrder.packageId = this._package.id;
                this.purchaseOrder.itemId = this._package.Item.id;
                this.priceAdjustment.packageId = this._package.id;

                let amount = this._package.wholesalePrice;

                this._package.PriceAdjustments = this._package.PriceAdjustments.map(adjustment => {
                    amount = amount + adjustment.amount;
                    adjustment.adjustedAmount = amount;

                    return adjustment;
                });

                this.loadingBarService.complete();
            });
    }

    showPurchaseOrder(scrollTarget){
        this.purchaseOrderShowing = true;
    }

    cancelPurchaseOrder(){
        this.purchaseOrderShowing = false;
        this.adjustmentErrors = [];
        this.clearErrorFlags();
        this.purchaseOrder.amount = 0;
        this.purchaseOrder.price = 0;
        this.purchaseOrder.notes = '';
    }

    savePurchaseOrder(){
        this.clearErrorFlags();
        let errors = [];
        if((this._package.Quantity + this.purchaseOrder.amount) < 0){
            //Error
            errors.push("Cannot adjust quantity below 0.");
            this.errorFlags.amount = true;
        }

        if(errors.length){
            this.adjustmentErrors = errors;
            return;
        }

        this.loadingBarService.interval = 40;
        this.loadingBarService.start();

        //Set the date
        this.purchaseOrder.date = new Date();
        this.purchaseOrder.userId = this.user.id;

        this.purchaseOrderService.save(this.purchaseOrder, () => {
            this._package.Quantity += this.purchaseOrder.amount;
            this._package.availableQuantity += this.purchaseOrder.amount;


            this.packageService.save(this._package, () => {
                setTimeout(() => {
                    const sub = this.packageService.resolveAssociations(this._package, ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments']).subscribe(_package => {

                        this._package = _package;
                        sub.unsubscribe();
                        this.loadingBarService.complete();

                    });

                    this.purchaseOrderShowing = false;
                    this.purchaseOrder = this.purchaseOrderService.newInstance();
                    this.purchaseOrder.packageId = this._package.id;
                    this.purchaseOrder.itemId = this._package.Item.id;
                }, 300);
            });


        });
    }

    shouldShowPurchaseOrders(){
        if (!this._package) return false;
        return (this._package.Item.ProductType.category === 'non-cannabis');
    }

    initializeAuditMode(){
        this.loadingBarService.interval = this.auditData ? 1 : 10;
        this.loadingBarService.start();

        const sub = this.packageService.resolveAssociations(this._package, ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments']).subscribe(_package => {
            sub.unsubscribe();

            this._package = _package;

            this.packageService.getPackageAudit(this._package.id)
                .then(auditData => {
                    this.auditData = auditData.changes;
                    this.auditName = auditData.name;
                    this.auditUnits = auditData.units;

                    // Enrich adjustments with newQuantity data (It's calculated, not stored)
                    this._package.Adjustments = this._package.Adjustments.map(adjustment => {
                        for (let auditDataRow of auditData.changes) {
                            if (auditDataRow.type == 'adjustment' && auditDataRow.objectId == adjustment.id) {
                                adjustment.newQuantity = auditDataRow.newQuantity;
                                break;
                            }
                        }

                        return adjustment;
                    })

                    this.loadingBarService.complete();
                });

            sub.unsubscribe();
        });
    }

    initializeReceiptsMode(){
        this.loadingBarService.interval = this.receipts ? 1 : 10;
        this.loadingBarService.start();

        const sub = this.salesReportService.salesBreakdownReportByPackageId(this._package.id)
            .subscribe(data => {
                sub.unsubscribe();

                this.receipts = data
                    .map(receipt => {
                        return {
                            object: receipt,
                            isToggled: !!(this.toggledReceiptBarcode == receipt.barcode)
                        }
                    });

                if (this.toggledReceiptBarcode) {
                    setTimeout(() => {
                        document.getElementById('R'+this.toggledReceiptBarcode).scrollIntoView();
                        this.toggledReceiptBarcode = '';
                    }, 500);
                }

                this.loadingBarService.complete();
                console.log('this.receipts', this.receipts);
            });
    }

    initializeBarcodesMode(){
        this.loadingBarService.interval = this.barcodes ? 1 : 10;
        this.loadingBarService.start();

        const sub = this.barcodeService.getByPackageId(this._package.id)
            .subscribe(barcodes => {
                sub.unsubscribe();

                Observable.combineLatest(barcodes.map(barcode => {
                    return this.barcodeService.resolveAssociations(barcode, ['productVariation', 'packages']);
                })).subscribe(barcodes => {
                    this.barcodes = barcodes;

                    console.log('this.barcodes', this.barcodes);
                });

                this.loadingBarService.complete();
            });
    }

    toDashboard(){
        this.packageService.dashboard();
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    savePackage(thcInfo = false){
        this.clearErrorFlags();
        let errors = [];
        this.packageErrors = [];

        if (!this._package) {
            errors.push('You have to select a package');
            this.errorFlags.name = true;
        } else {

            if(!thcInfo){
                if (this._package.perUnitWholesalePrice !== 0 && !this._package.perUnitWholesalePrice) {
                    errors.push('Per Unit Wholesale Price is a required field.');
                    this.errorFlags.name = true;
                }

                if (this._package.wholesalePrice !== 0 && !this._package.wholesalePrice) {
                    errors.push('Wholesale Price is a required field.');
                    this.errorFlags.name = true;
                }
            }
        }

        if (errors.length) {
            this.packageErrors = errors;
            return;
        }

        this.loadingBarService.interval = 40;
        this.loadingBarService.start();

        let packageToSave = new Package(this._package);

        console.log(`====TO SAVE====`);
        console.log(packageToSave);
        console.log(`====TO SAVE====`);

        console.log(`====ORIGINAL====`);
        console.log(this._package);
        console.log(`====ORIGINAL====`);

        if (this.product.Item && this.product.Item.thcWeight !== null) {
            this.labTestResultService.save(this._package.LabTestResult, () => {
                this.packageService.save(packageToSave, () => {
                    this.itemService.saveThcWeight(this.product.Item.id, this.product.Item.thcWeight, () => {
                        this.loadingBarService.complete();
                    });
                });
            });
        } else {
            this.labTestResultService.save(this._package.LabTestResult, () => {
                this.packageService.save(packageToSave, ()=>{
                    this.loadingBarService.complete();
                });
            });
        }
    }

    updateReceivedQuantity(event: any){
        if(this._package){
            this._package.perUnitWholesalePrice = Math.round(this._package.wholesalePrice / parseFloat(event.target.value)*100) / 100;
        }
    }

    updatePackagePerUnitWholesalePrice(event: any) {
        if (this._package) {
            this._package.perUnitWholesalePrice = Math.round(parseFloat(event.target.value) / this._package.ReceivedQuantity*100) / 100;
        }
    }

    updatePackageWholesalePrice(event: any) {
        if (this._package) {
            this._package.wholesalePrice = Math.round(parseFloat(event.target.value) * this._package.ReceivedQuantity*100) / 100;
        }
    }

    updateCannabinoidTotal(){
        this.cannabinoidTotal = (this._package.thcPercent ? this._package.thcPercent : 0) + (this._package.cbdPercent ? this._package.cbdPercent : 0);

        if (!this.cannabinoidTotal) {
            this.cannabinoidTotal = null;
        }
    }

    saveProduct(product, callback?: any, skipLoadingBar?: boolean, customSaveMessage?: string){
        this.clearErrorFlags();
        let errors = [];
        if (!product.productTypeId) {
            errors.push('Products must have a product type.');
            this.errorFlags.productTypeId = true;
        }
        if (!product.name) {
            errors.push('Name is a required field.');
            this.errorFlags.name = true;
        }
        if(product.inventoryType == 'weight' && !product.pricingTierId){
            errors.push("This product must have a pricing tier");
            this.errorFlags.pricingTier = true;
        }

        if (errors.length) {
            this.productErrors = errors;
            return;
        }

        if (!skipLoadingBar) {
            this.loadingBarService.interval = 10;
            this.loadingBarService.start();
        }

        this.productSavedIndicator = true;
        setTimeout(() => {
            this.productSavedIndicator = false;
        }, 1000);

        if (!customSaveMessage) customSaveMessage = 'Product Details saved';
        this.productService.save(product, false, true, callback, customSaveMessage);

        if (!skipLoadingBar) {
            this.loadingBarService.complete();
        }

    }

    autoSavePricingTier(pricingTier: string){
        this.product.pricingTierId = pricingTier;
        this.saveProduct(this.product, false, false, "Pricing Tier saved");
    }

    calculateProductVariationPrice(productVariation: IProductVariation){
        if(this.product.inventoryType == 'weight'){
            let quantity = 0;
            productVariation.Items.forEach(item => {
                quantity += item.ProductVariationItem.quantity;
            });

            productVariation.quantity = quantity;
            if(this.product.PricingTier){
                let pricePer = ProductVariationService.getPriceFromTier(productVariation, this.product.PricingTier);
                return formatCurrency(pricePer * quantity, { format: '%s%v', code: 'USD', symbol: '$' });
            }else{
                //No pricing tier set, cannot show price
                return "No Pricing Tier";
            }
        }else{
            return formatCurrency(productVariation.price,{ format: '%s%v', code: 'USD', symbol: '$' });
        }
    }

    goToBarcode(productVariation: IProductVariation){
        productVariation.Product = this.product;
        this.packageBarcodeNavigationService.createFromProductVariation(productVariation, this._package);
    }

    editProductVariation(productVariationObj){
        productVariationObj.isEditing = true;
    }

    saveProductVariation(productVariationObj, skipNotification?, callback?){

        const productVariation = {...productVariationObj.productVariation};

        this.productVariationService.save(productVariation, () => {
            productVariationObj.isEditing = false;

            if (callback) {
                callback();
            }

        }, skipNotification);
    }

    addProductVariation(){
        this.productService.addProductVariationToProduct(this.product);
    }

    saveAllProductPage(){

        this.loadingBarService.interval = 30;

        const product = Object.assign({}, this.product);
        let promises = [];

        for(let obj of this.productVariationsWithEdit){
            if(obj.isEditing){
                promises.push(new Promise(resolve => this.saveProductVariation(obj, true, resolve)));
                this.loadingBarService.interval += 5;
            }
        }

        this.loadingBarService.start();

        Promise.all(promises).then(() => {
            this.product = product;
            this.saveProduct(product, ()=>{
                this.loadingBarService.complete();
            }, true);
        });

    }

    saveAllPackagePage(){
        this.savePackage(true);
    }

    showAdjustment(){
        this.adjustmentShowing = true;
    }

    saveAdjustment(){
        this.clearErrorFlags();
        let errors = [];
        if((this._package.Quantity + this.adjustment.amount) < 0){
            //Error
            errors.push("Cannot adjust quantity below 0.");
            this.errorFlags.amount = true;
        }


        if(!this.adjustment.reason){
            errors.push("Must specify reason for adjustment.");
            this.errorFlags.reason = true;
        }

        if(errors.length){
            this.adjustmentErrors = errors;
            return;
        }

        this.loadingBarService.interval = 40;
        this.loadingBarService.start();

        //Set the date
        this.adjustment.date = new Date();
        this.adjustment.userId = this.user.id;

        this.adjustmentService.save(this.adjustment, () => {

            //Adjust package quantity and save
            this._package.Quantity += this.adjustment.amount;
            this._package.availableQuantity += this.adjustment.amount;

            this.packageService.save(this._package, () => {

                setTimeout(() => {
                    const sub = this.packageService.resolveAssociations(this._package, ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments']).subscribe(_package => {

                        this._package = _package;
                        sub.unsubscribe();
                        this.loadingBarService.complete();

                    });

                    this.adjustmentShowing = false;
                    //Clear the adjustment
                    this.adjustment = this.adjustmentService.newInstance();
                    this.adjustment.packageId = this._package.id;

                }, 300);
            });
        }, true);
    }

    cancelAdjustment(){
        this.adjustmentShowing = false;
        this.adjustmentErrors = [];
        this.clearErrorFlags();
        this.adjustment.amount = 0;
        this.adjustment.reason = '';
        this.adjustment.notes = '';
    }

    showPriceAdjustment(){
        this.priceAdjustmentShowing = true;
    }

    savePriceAdjustment(){
        this.clearErrorFlags();
        let errors = [];

        if(!this.priceAdjustment.reason){
            errors.push("Must specify reason for adjustment.");
            this.errorFlags.reason = true;
        }

        if(errors.length){
            this.adjustmentErrors = errors;
            return;
        }

        //Set the date
        this.priceAdjustment.date = new Date();
        this.priceAdjustment.userId = this.user.id;

        this.packagePriceAdjustmentService.save(this.priceAdjustment, undefined, true);

        //Save package
        this.packageService.save(this._package, () => {

            setTimeout(() => {
                const sub = this.packageService.resolveAssociations(this._package, ['item', 'supplier', 'adjustments', 'purchaseOrders', 'priceAdjustments']).subscribe(_package => {
                    this._package = _package;
                    sub.unsubscribe();

                    let amount = this._package.wholesalePrice;

                    this._package.PriceAdjustments = this._package.PriceAdjustments.map(adjustment => {
                        amount = amount + adjustment.amount;
                        adjustment.adjustedAmount = amount;

                        return adjustment;
                    });
                });

                this.priceAdjustmentShowing = false;
                //Clear the adjustment
                this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();
                this.priceAdjustment.packageId = this._package.id;
            }, 300);
        });
    }

    cancelPriceAdjustment(){
        this.priceAdjustmentShowing = false;
        this.adjustmentErrors = [];
        this.clearErrorFlags();
        this.priceAdjustment.amount = 0;
        this.priceAdjustment.reason = '';
        this.priceAdjustment.notes = '';
    }

    private _adjustmentAmount: number = 0;
    set adjustmentAmount(value: number){
        this._adjustmentAmount =  value;
    }
    get adjustmentAmount(){
        return this._adjustmentAmount;
    }

    private _adjustmentReason: string = '';
    set adjustmentReason(value: string){
        this._adjustmentReason =  value;
    }
    get adjustmentReason(){
        return this._adjustmentReason;
    }

    private _adjustmentNotes: string = '';
    set adjustmentNotes(value: string){
        this._adjustmentNotes = value;
    }
    get adjustmentNotes(){
        return this._adjustmentNotes;
    }

    openReceipt(receiptBarcode: string, checkPackage: boolean = false) {
        if (checkPackage) {
            this.packageService.getByReceiptBarcode(receiptBarcode).then(_package => {
                if (_package.id == this._package.id) {
                    console.log('PACKAGES MISMATCH!!!', _package.id, this._package.id)
                } else {
                    this.toggledReceiptBarcode = receiptBarcode;
                    this.mode = 'receipts';
                }
            });
        } else {
            this.toggledReceiptBarcode = receiptBarcode;
            this.mode = 'receipts';
        }
    }

    resetReceiptBarcodeCopies() {
        this.receipts.forEach(receipt => {
            receipt.object.LineItems = receipt.object.LineItems.map(lineItem => {
                if (lineItem.Barcode) {
                    lineItem.Barcode.barcodeTemporaryCopy = lineItem.Barcode.barcode.slice();
                }

                return lineItem;
            });
        })
    }

    editReceiptByBarcode() {
        this.resetReceiptBarcodeCopies();
        this.editingReceiptByBarcode = true;
    }

    editReceiptManually(transaction) {

        // Preselect it on the very first time button is clicked
        this._selectedPackageId = transaction.Package.id;
        this.selectedProductVariationId = transaction.productVariationId;

        this.editingTransaction = transaction.id;
        this.selectedPackageItemName = transaction.Package.Item.name;
        this.editingReceiptManually = true;

        console.log('setting packaged id to', this.selectedPackageId);
        console.log('setting productvariationid id to', this.selectedProductVariationId);

        this.setVariationOptions();

        setTimeout(() => {
            this.packageService.getAssociated(this._selectedPackageId)
                .take(1).subscribe(package_ => {
                    this.setVariationOptions(package_.Item.id);
                });
        }, 100);
    }

    cancelReceiptEditing() {
        this.resetReceiptBarcodeCopies();

        this.editingReceiptByBarcode = false;
        this.editingReceiptManually = false;
    }

    saveEditReceiptByBarcode(transaction, lineItem) {
        // Modify only upon newly selected barcode and package wasn't sent to Metrc
        if (lineItem.Barcode.barcode != lineItem.Barcode.barcodeTemporaryCopy && !transaction.sentToMetrc) {

            this.loadingBarService.interval = 20;
            this.loadingBarService.start();

            this.tempSubscription = this.barcodeService.getByBarcodeString(lineItem.Barcode.barcodeTemporaryCopy).subscribe(barcodeObservable => {
                this.tempSubscription.unsubscribe();

                this.tempSubscription = barcodeObservable.subscribe(barcode => {
                    this.tempSubscription.unsubscribe();

                    const oldPackageId = transaction.packageId.slice();

                    lineItem.barcodeId = barcode.id;
                    lineItem.productVariationId = barcode.ProductVariation.id;
                    lineItem.productId = barcode.ProductVariation.Product.id;

                    transaction.packageId = barcode.Packages[0].id;
                    transaction.productId = lineItem.productId;
                    transaction.productVariationId = lineItem.productVariationId;
                    transaction.itemId = barcode.ProductVariation.Items[0].id;
                    transaction.PackageLabel = barcode.Packages[0].Label;

                    console.log(`Going to save:
                        lineItem.barcodeId = ${barcode.id};
                        lineItem.productVariationId = ${barcode.ProductVariation.id};
                        lineItem.productId = ${barcode.ProductVariation.Product.id};

                        transaction.packageId = ${barcode.Packages[0].id};
                        transaction.productId = ${lineItem.productId};
                        transaction.productVariationId = ${lineItem.productVariationId};
                        transaction.itemId = ${barcode.ProductVariation.Items[0].id};
                        transaction.PackageLabel = ${barcode.Packages[0].Label};
                    `);

                    const amountToAdjust = transaction.QuantitySold;

                    this.lineItemService.save(lineItem, () => {
                        this.transactionService.save(transaction, ()=>{

                            console.log(`Going to adjust amount of original package:
                                packageId: ${oldPackageId},
                                amount: ${amountToAdjust},
                                receiptId: ${lineItem.receiptId}
                            `);

                            this.saveNewQuantity(oldPackageId, 'Receipts Barcode Modification (original)', amountToAdjust, lineItem.receiptId)
                                .then(()=>{

                                    if (this._package.id == oldPackageId) {
                                        // Save new Quantity immediately to not confuse the user
                                        this._package.Quantity += amountToAdjust;
                                        this._package.availableQuantity += amountToAdjust;
                                    }

                                    console.log(`Going to adjust amount of updated package:
                                        packageId: ${transaction.packageId},
                                        amount: ${-1*amountToAdjust},
                                        receiptId: ${lineItem.receiptId}
                                    `);

                                    this.saveNewQuantity(transaction.packageId, 'Receipts Barcode Modification (updated)', -1*amountToAdjust, lineItem.receiptId)
                                        .then(()=>{
                                            this.cancelReceiptEditing();
                                            this.loadingBarService.complete();
                                            this.createNewAdjustmentObject(this._package.id);

                                            $.notify(`Saved successfully`, "success");
                                        });
                                });

                            this.salesReportService.salesBreakdownReportByPackageId(this._package.id)
                                .subscribe(data => {
                                    this.receipts = data
                                        .map(receipt => {
                                            return {
                                                object: receipt,
                                                isToggled: !!(transaction.receiptId == receipt.id)
                                            }
                                        });
                                    });
                        }, true)
                    }, true);
                })
            });
        } else {
            this.cancelReceiptEditing();
        }
    }

    saveEditReceiptManually(transaction, lineItem) {
        // Modify only upon newly selected package and package wasn't sent to Metrc
        console.log('transaction', transaction);
        console.log('lineItem', lineItem);
        console.log('selectedPackageId', this.selectedPackageId);
        console.log('selectedProductVariationId', this.selectedProductVariationId);

        if ((transaction.Package.id != this.selectedPackageId || transaction.productVariationId != this.selectedProductVariationId) && this.selectedProductVariationId && !transaction.sentToMetrc) {
            console.log(`Changed selectedPackageId: ${transaction.Package.id} != ${this.selectedPackageId}
                variation: ${transaction.productVariationId} != ${this.selectedProductVariationId}
            `);

            this.loadingBarService.interval = 20;
            this.loadingBarService.start();

            this.tempSubscription = Observable.combineLatest(
                this.packageService.getAssociated(this.selectedPackageId),
                this.productVariationService.getAssociated(this.selectedProductVariationId)
            ).subscribe(([package_, productVariation]) => {
                if (this.tempSubscription) {
                    this.tempSubscription.unsubscribe();
                }

                const oldPackageId = transaction.Package.id.slice();

                lineItem.barcodeId = null;
                lineItem.productVariationId = this.selectedProductVariationId;
                lineItem.productId = productVariation.Product.id;

                transaction.packageId = this.selectedPackageId;
                transaction.productId = lineItem.productId;
                transaction.productVariationId = this.selectedProductVariationId;
                transaction.itemId = productVariation.Product.Item.id;
                transaction.PackageLabel = package_.Label;

                console.log(`Going to save:
                    lineItem.barcodeId = ${null};
                    lineItem.productVariationId = ${this.selectedProductVariationId};
                    lineItem.productId = ${productVariation.Product.id};

                    transaction.packageId = ${this.selectedPackageId};
                    transaction.productId = ${lineItem.productId};
                    transaction.productVariationId = ${this.selectedProductVariationId};
                    transaction.itemId = ${productVariation.Product.Item.id};
                    transaction.PackageLabel = ${package_.Label};
                `);

                const amountToAdjust = transaction.QuantitySold;

                this.lineItemService.save(lineItem, () => {
                    this.transactionService.save(transaction, ()=>{

                        console.log(`Going to adjust amount of original package:
                            packageId: ${oldPackageId},
                            amount: ${amountToAdjust},
                            receiptId: ${lineItem.receiptId}
                        `);

                        this.saveNewQuantity(oldPackageId, 'Receipts Manual Modification (original)', amountToAdjust, lineItem.receiptId)
                            .then(()=>{

                                if (this._package.id == oldPackageId) {
                                    // Save new Quantity immediately to not confuse the user
                                    this._package.Quantity += amountToAdjust;
                                    this._package.availableQuantity += amountToAdjust;
                                }

                                console.log(`Going to adjust amount of updated package:
                                    packageId: ${transaction.packageId},
                                    amount: ${-1*amountToAdjust},
                                    receiptId: ${lineItem.receiptId}
                                `);

                                this.saveNewQuantity(transaction.packageId, 'Receipts Manual Modification (updated)', -1*amountToAdjust, lineItem.receiptId)
                                    .then(()=>{
                                        this.cancelReceiptEditing();
                                        this.loadingBarService.complete();
                                        this.createNewAdjustmentObject(this._package.id);

                                        $.notify(`Saved successfully`, "success");
                                    });
                            });

                        this.salesReportService.salesBreakdownReportByPackageId(this._package.id)
                            .subscribe(data => {
                                this.receipts = data
                                    .map(receipt => {
                                        return {
                                            object: receipt,
                                            isToggled: !!(transaction.receiptId == receipt.id)
                                        }
                                    });
                                });
                    }, true)
                }, true);
            });

        } else {
            this.cancelReceiptEditing();
        }
    }

    saveNewQuantity(packageId: string, reason?: string, amount?: number, receiptId?: string) {
        console.log(`Promising to resolve ${packageId}`);

        return new Promise((resolve, reject) => {

            return new Promise((receiptResolver) => {

                if (!receiptId) {
                    return receiptResolver('');
                }

                const sub = this.receiptService.get(receiptId).subscribe(receipt => {
                    return receiptResolver(receipt.barcode);
                })

            }).then((receiptBarcode: string) => {
                console.log('receiptBarcode', receiptBarcode);

                let adjustment = this.receiptAdjustmentService.newInstance();

                adjustment.packageId = packageId;
                adjustment.receiptId = receiptId;
                adjustment.reason = reason;
                adjustment.amount = amount;
                adjustment.notes = receiptBarcode ? receiptBarcode : '';
                adjustment.date = new Date();
                adjustment.userId = this.user.id;

                this.receiptAdjustmentService.save(adjustment, () => {

                    this.packageService.addQuantity(packageId, amount)
                        .then(() => {
                            console.log('RESOLVED', packageId);
                            return resolve();
                        })

                }, true);
            })
        });
    }

    createNewAdjustmentObject(packageId: string, reason?: string, amount?: number, receiptBarcode?: string){
        this.adjustment = this.adjustmentService.newInstance();
        this.adjustment.packageId = packageId;
        this.adjustment.reason = reason;
        this.adjustment.amount = amount;
        this.adjustment.notes = receiptBarcode ? receiptBarcode : '';
        this.adjustment.date = new Date();
        this.adjustment.userId = this.user.id;
    }

    onBarcodeRowClick(event, barcode: IBarcode) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewBarcode(barcode);
    }

    productVariationPrice(productVariation: IProductVariation){
        if(productVariation.Product.inventoryType == 'weight') {
            if(productVariation.Product.PricingTier) {
                let pricePer = ProductVariationService.getPriceFromTier(productVariation, productVariation.Product.PricingTier);
                return formatCurrency(pricePer * productVariation.quantity, {format: '%s%v', code: 'USD', symbol: '$'});
            }else{
                return "No Pricing Tier";
            }
        }else{
            return formatCurrency(productVariation.price, {format: '%s%v', code: 'USD', symbol: '$'});
        }
    }

    viewAllocation(barcode: IBarcode){
        this.barcodeService.viewAllocation(barcode);
    }

    printBarcodes(barcode: IBarcode){
        let dialogRef = this.dialog.open(PrintBarcodeModalComponent, {
            width: '300px',
            height: '280px',
            data: { printType: 'barcode' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            console.log(result); // result will be pass as an int if it's valid.

            if (result) {
                this.barcodeService.printBarcodes(barcode.barcode, result)
                    .then(s3Link => {
                        console.log("Received: " + s3Link);

                        $("<iframe/>").attr({
                            src: s3Link,
                            style: "visibility:hidden;display:none"
                        }).appendTo(".content");
                    })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    })
            }
        })
    }

    printBarcodeLabels(barcode: IBarcode){

        let dialogRef = this.dialog.open(PrintBarcodeModalComponent, {
            width: '300px',
            height: '280px',
            data: { printType: 'barcode' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            console.log(result); // result will be pass as an int if it's valid.

            if (result) {
                let barcodeToSend = new Barcode(barcode);
                let packageToSend = new Package(barcode.Packages[0]);

                barcodeToSend.Items = [];
                barcodeToSend.Packages = [];

                let productVariationToSend = new ProductVariation(barcode.ProductVariation);

                barcodeToSend.ProductVariation = productVariationToSend;

                productVariationToSend.Items = [];

                let type = barcode.ProductVariation.Product.ProductType.category;

                productVariationToSend.Product = new Product(barcode.ProductVariation.Product);

                productVariationToSend.Product.Item = undefined;
                productVariationToSend.Product.ProductVariations = [];
                productVariationToSend.Product.PricingTier = undefined;
                productVariationToSend.Product.ProductType = undefined;

                console.log(barcodeToSend);
                console.log(productVariationToSend);

                this.printerService.printBarcodeLabels(barcodeToSend, productVariationToSend, packageToSend, type, result);
            }
        })
    }

    createBarcode(productVariationId?: string, productId?: string, productTypeId?: string){
        this.barcodeService.create(productVariationId, productId, productTypeId);
    }


    listBarcodes(){
        this.barcodeService.list();
    }

    viewBarcode(barcode: IBarcode){
        this.barcodeService.view(barcode);
    }

    private _selectedPackageId: string;
    get selectedPackageId() {
        return this._selectedPackageId;
    }
    set selectedPackageId(newValue: string) {
        console.log('package was selected!', newValue);

        if (this._selectedPackageId != newValue) {
            this.selectedProductVariationId = undefined;
        }

        this._selectedPackageId = newValue;
/*
        const selectedProductVariationId = this.selectedProductVariationId;
        const selectSelectedProductVariationId = () => {
            this.selectedProductVariationId = selectedProductVariationId;
        };
*/
        // Empty variation options
        this.setVariationOptions();

        this.packageService.getAssociated(this._selectedPackageId)
            .subscribe(package_ => {
                this.selectedPackageItemName = package_.Item.name;
                this.setVariationOptions(package_.Item.id);
            });
    }

    setVariationOptions(itemId?: string, callback?: any) {

        // this.selectedProductVariationId = undefined;

        if (!itemId) {

            this.productVariationSelect2Options.data = [];
            this.updateSelect2('#productVariationSelect2 select', this.productVariationSelect2Options.data);

            if (callback) {
                callback();
            }

        } else {
            this.productVariationService.getProductVariationsByItemId(itemId)
                .subscribe(productVariationObservables => {

                    Observable.combineLatest(productVariationObservables).subscribe(productVariations => {
                        this.productVariationSelect2Options.data = productVariations.map(productVariation => {
                            return { id: productVariation.id, text: productVariation.name };
                        });

                        if (this.selectedProductVariationId) {
                            this.productVariationSelect2Options.data.sort((a, b) => a.id == this.selectedProductVariationId ? -1 : 1);
                        } else {
                            this.selectedProductVariationId = this.productVariationSelect2Options.data[0].id;
                        }

                        this.updateSelect2('#productVariationSelect2 select', this.productVariationSelect2Options.data);

                        console.log(this.productVariationSelect2Options.data);

                        if (callback) {
                            callback();
                        }
                    });
                })
        }
    }

    updateSelect2(domElementLookup: string, items: object[]) {
        const $dropdown = $(domElementLookup);
        if ($dropdown && $dropdown.data('select2')) {
            const dataAdapter = $dropdown.data('select2').dataAdapter;

            $dropdown.html('');
            dataAdapter.addOptions(dataAdapter.convertToOptions(items));
        }
    }

    onCreateConvertClick() {
        this.packageService.createConvertView(this._package);
    }

    toggleReceipt(receipt){

        var previousToggled = receipt.isToggled;

        this.receipts.forEach((r) => {
            r.isToggled = false;
        });

        receipt.isToggled = !previousToggled;
    }
}
