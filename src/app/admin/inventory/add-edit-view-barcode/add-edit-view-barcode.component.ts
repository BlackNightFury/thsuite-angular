import {AddEditViewObjectComponent} from "../../../util/add-edit-view-object.component";
import {PrintBarcodeModalComponent} from "../../../modals/print-barcode-modal/print-barcode-modal.component";
import {IBarcode} from "../../../models/interfaces/barcode.interface";
import {Component, ElementRef, Injector, ViewChild, OnInit, ViewContainerRef} from "@angular/core";
import {BarcodeService} from "../../../services/barcode.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ProductTypeService} from "../../../services/product-type.service";
import {ProductService} from "../../../services/product.service";
import {ProductVariationService} from "../../../services/product-variation.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {Observable} from "rxjs/Observable";
import {IProductVariation} from "../../../models/interfaces/product-variation.interface";
import {PackageService} from "../../../services/package.service";
import {IPackage} from "../../../models/interfaces/package.interface";
import {IProduct} from "../../../models/interfaces/product.interface";
import {Item} from "../../../models/item.model";
import {Package} from "../../../models/package.model";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {environment} from "../../../../environments/environment";

import * as formatCurrency from 'format-currency';
import * as moment from 'moment';
import {ProductVariation} from "../../../models/product-variation.model";
import {PrinterService} from "../../../services/printer.service";
import {Barcode} from "../../../models/barcode.model";
import {Product} from "../../../models/product.model";
import {Subscription} from "rxjs/Subscription";
import {IStore} from "../../../models/interfaces/store.interface";
import {StoreService} from "../../../services/store.service";
import {BarcodeNavigationService} from "../../../services/barcode-navigation.service";
import {PackageBarcodeNavigationService} from "../../../services/package-barcode-navigation.service";
import {any} from "codelyzer/util/function";
import {MdDialog} from "@angular/material";

declare const $;

@Component({
    selector: 'app-add-edit-view-barcode',
    templateUrl: './add-edit-view-barcode.component.html',
    styleUrls: ['./add-edit-view-barcode.component.css'],
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewBarcodeComponent extends AddEditViewObjectComponent<IBarcode> implements OnInit{

    barcodeNavigationService : BarcodeNavigationService;

    @ViewChild('root')overlayRoot: ElementRef;

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options: Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productVariationSelect2Options: Select2Options;
    productVariationSelect2InitialValue: string[] = [];
    selectedProductVariationIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    nextProductVariationSelect2Options: Select2Options;
    nextProductVariationSelect2InitialValue: string[] = [];

    packageSelect2Options: Select2Options;
    packageSelect2InitialValue: string[] = [];

    productSelect2SearchArgs: {productTypeId: string} = {productTypeId: undefined};
    productVariationSelect2SearchArgs: {productId: string} = {productId: undefined};
    nextProductVariationSelect2SearchArgs: {productId: string} = {productId: undefined};
    nextPackageSelect2SearchArgs: {finishedMode:string} = {finishedMode: 'hide'};

    productDisabled: boolean = true;
    productVariationDisabled: boolean = true;

    productVariation: IProductVariation;
    productVariationItems: any[] = [];

    productVariationSubscription: Subscription;

    barcodeCreatedDate: string;

    providedPackageId: string;
    selectedPackageId: string;

    showingBarcodeNextVariationForm:boolean = false;
    showingBarcodeNextPackageForm:boolean = false;

    errors: string[];

    nextPackageIdToBarcode:string;
    nextVariationIdToBarcode:string;

    errorFlags: {
        barcode: boolean;
        productType: boolean;
        product: boolean;
        productVariation: boolean;
        composition: any;
        nextVariationToBarcode: boolean;
        nextPackageToBarcode: boolean;
    } = {
        barcode: false,
        productType: false,
        product: false,
        productVariation: false,
        composition: {},
        nextVariationToBarcode: false,
        nextPackageToBarcode: false
    };

    store: IStore;

    parentDashboard: string;

    constructor(
        injector: Injector,
        private storeService: StoreService,
        private barcodeService: BarcodeService,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        private productVariationService: ProductVariationService,
        private packageService: PackageService,
        private printerService: PrinterService,
        private packageBarcodeNavigationService : PackageBarcodeNavigationService,
        private dialog: MdDialog
    ){
        super(injector, barcodeService);
    }


    ngOnInit(){
        super.ngOnInit();

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        });

        this.objectObservable.take(1).subscribe(object => {
            console.log(object);
            if(object.ProductVariation){
                this.productVariation = object.ProductVariation;
                this.nextProductVariationSelect2SearchArgs.productId = this.productVariation.productId;
            }

            this.barcodeCreatedDate = moment.utc(object.createdAt).local().format("MMMM D, YYYY @ hh:mm a");

            if(this.mode == 'edit' || this.mode == 'view'){
                this.selectedPackageId = object.Packages[0].id;
                this.selectedProductVariationId = object.productVariationId;
            }
        });

        this.route.data.subscribe((data) => {
            this.parentDashboard = data.parentDashboard;

            if(this.parentDashboard == "barcodes"){
                this.barcodeNavigationService = this.barcodeService;
            } else {
                this.barcodeNavigationService = this.packageBarcodeNavigationService;
            }
        });

        if(this.parentDashboard == "packages") {
            //Get the params of the package details component to get the package id
            this.route.parent.params.subscribe((params) => {
                this.selectedPackageId = params.id;
                this.providedPackageId = params.id;
            }); 
        }

        this.route.queryParams.subscribe(params => {

            //All three need to be there
            if(params.productTypeId && params.productId){
                this.selectedProductTypeId = params.productTypeId;
                this.selectedProductId = params.productId;
            }

            if(params.productVariationId) {
                this.selectedProductVariationId = params.productVariationId;
            }

            if(params.productTypeId && params.productId || params.productVariationId){
                if(this.parentDashboard == "barcodes") {
                    //Enable all dropdowns
                    this.productDisabled = false;
                    this.productVariationDisabled = false;
                }
            }
        });

        Observable.combineLatest(
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.productService, 'id', 'name', this.productSelect2SearchArgs),
            CommonAdapter(this.productVariationService, 'id', 'name', this.productVariationSelect2SearchArgs),
            CommonAdapter(this.productVariationService, 'id', 'name', this.nextProductVariationSelect2SearchArgs),
            CommonAdapter(this.packageService, 'id', 'Label', this.nextPackageSelect2SearchArgs)
        ).toPromise()
            .then(([ProductTypeAdapter, ProductAdapter, ProductVariationAdapter, NextProductVariationAdapter, PackageAdapter]) => {

                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Product Type',
                    allowClear: true
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];

                this.productSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Product',
                    allowClear: true
                };

                this.productSelect2Options['dataAdapter'] = ProductAdapter;
                this.productSelect2InitialValue = [];

                this.productVariationSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Product Variation',
                    allowClear: true
                };

                this.productVariationSelect2Options['dataAdapter'] = ProductVariationAdapter;
                this.productVariationSelect2InitialValue = [];

                this.nextProductVariationSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Product Variation',
                    allowClear: true
                };

                this.nextProductVariationSelect2Options['dataAdapter'] = NextProductVariationAdapter;
                this.nextProductVariationSelect2InitialValue = [];

                this.packageSelect2Options = {
                    ajax: {},
                    placeholder: 'Select Package',
                    allowClear: true
                };

                this.packageSelect2Options['dataAdapter'] = PackageAdapter;
                this.packageSelect2InitialValue = [];
            });


        this.productVariationSubscription = this.selectedProductVariationIdSource.subscribe(id => {
            if (id) {
                this.productVariationService.getAssociated(id).subscribe(productVariation => {
                    console.log(productVariation);
                    this.productVariation = productVariation;
                    //Set up items selects
                    let promises = this.productVariation.Items.map(item => {

                        return new Promise(resolve => {

                            //Need options and to init adapter
                            let select2Options: Select2Options = {
                                ajax: {},
                                placeholder: 'Select Package',
                                language: {
                                    noResults: function(){
                                        return "No packages with available inventory found."
                                    }
                                }
                            };

                            select2Options['dataAdapter'] = '';

                            CommonAdapter(this.packageService, 'id', 'Label', {
                                itemId: item.id,
                                quantity: 0,
                                quantityComparator: 'gt'
                            })
                                .then(adapter => {
                                    console.log(adapter);
                                    select2Options['dataAdapter'] = adapter;

                                    let result = {
                                        item: item,
                                        selectedPackage: this.selectedPackageId ? this.selectedPackageId : '',
                                        options: select2Options
                                    };

                                    return resolve(result);

                                });

                        });

                    });

                    let all = Promise.all(promises);

                    all.then(items => {
                        this.productVariationItems = items;
                    })

                });
            }

        });
    }

    ngOnDestroy(){
        this.objectSubscription && this.objectSubscription.unsubscribe();
        this.productVariationSubscription && this.productVariationSubscription.unsubscribe();
    }

    productVariationPrice(){
        if(this.object.ProductVariation.Product.inventoryType == 'weight') {
            if(this.object.ProductVariation.Product.PricingTier) {
                let pricePer = ProductVariationService.getPriceFromTier(this.object.ProductVariation, this.object.ProductVariation.Product.PricingTier);
                return formatCurrency(pricePer * this.object.ProductVariation.quantity, {format: '%s%v', code: 'USD', symbol: '$'});
            }else{
                return "No Pricing Tier";
            }
        }else{
            return formatCurrency(this.object.ProductVariation.price, {format: '%s%v', code: 'USD', symbol: '$'});
        }
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            if(key != 'composition') {
                this.errorFlags[key] = false;
            }
        });

        this.errorFlags.composition = {};
    }

    edit(){
        this.barcodeNavigationService.edit(this.object, this.selectedPackageId);
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active' && this.parentDashboard == "barcodes") {
            this.barcodeService.list();
        } else if(this.animationStatus === 'active') {
            this.packageBarcodeNavigationService.viewPackageProduct(this.selectedPackageId);
        }
    }

    async save(){
        this.clearErrorFlags();

        //Unsubscribe on save
        this.objectSubscription && this.objectSubscription.unsubscribe();
        this.productVariationSubscription && this.productVariationSubscription.unsubscribe();

        let errors = [];

        if(this.mode == 'add'){

            if(!this.selectedProductTypeId){
                errors.push("A product type must be selected.");
                this.errorFlags.productType = true;
            }

            if(!this.selectedProductId){
                errors.push("A product must be selected.");
                this.errorFlags.product = true;
            }

            if(!this.selectedProductVariationId){
                errors.push("A product variation must be selected.");
                this.errorFlags.productVariation = true;
            }

        }

        console.log(this.object);

        this.object.barcode = this.object.barcode.trim();

        if(!this.object.barcode){
            errors.push("The barcode field cannot be blank.");
            this.errorFlags.barcode = true
        }


        let compositionError = false;
        if(this.mode == 'add'){
            for(let item of this.productVariationItems){
                if(!item.selectedPackage){
                    compositionError = true;
                    this.errorFlags.composition[item.item.id] = true;
                }
            }
        }


        if(compositionError){
            errors.push("All items must have a package selected.");
        }

        console.log(this.object.barcode);

        let isDuplicate = await this.barcodeService.checkDuplicate(this.object.barcode);

        if(isDuplicate){
            errors.push("This barcode is a duplicate of an already existing barcode.");
            this.errorFlags.barcode = true;
        }

        //Do the rest
        if(errors.length){
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.object.createdAt = moment().utc().format();

        if( this.mode == 'add' && this.productVariation.Product.inventoryType === 'each' ) {

            let inventory = 0

            for(let item of this.productVariationItems){
                const selectedPackageId = item.selectedPackage
                item.item.Packages.forEach( _package => {
                    if( _package.id == selectedPackageId ) {
                        inventory += ( _package.availableQuantity / item.item.ProductVariationItem.quantity )
                        _package.availableQuantity = 0

                        this.packageService.save(_package);
                    }
                } )
            }

            this.object.remainingInventory = inventory;
            this.object.allocatedInventory = inventory;
        }

        this.object.Items = [];
        this.object.ItemPackages = [];
        this.object.Packages = [];

        for(let item of this.productVariationItems){

            this.object.Items.push(item.item);

            this.object.ItemPackages.push({
                itemId: item.item.id,
                packageId: item.selectedPackage
            });

            for(let _package of item.item.Packages){
                if(_package.id == item.selectedPackage){
                    this.object.Packages.push(_package);
                }
            }

        }

        this.object.productVariationId = this.object.productVariationId ? this.object.productVariationId : this.productVariation.id;

        this.barcodeService.save(this.object, () => {
            if( this.mode == 'add' && environment.shouldAutoAllocateInventory && this.productVariation.Product.inventoryType !== 'each' ) {
                this.barcodeNavigationService.allocateInventory(this.object, this.selectedPackageId);

            } else {
                this.barcodeNavigationService.view(this.object, this.selectedPackageId);
            }
        });


        //Need to set this product variation as read only
        //This has the same issue described above
        let productVariationToSave = new ProductVariation(this.productVariation);
        productVariationToSave.readOnly = 1;
        let itemsToSave = [];
        for(let item of this.productVariation.Items){
            let itemToSave = new Item(item);
            itemToSave.Packages = undefined;
            itemToSave.ProductType = undefined;
            itemToSave.Supplier = undefined;
            itemsToSave.push(itemToSave);
        }
        productVariationToSave.Items = itemsToSave;
        productVariationToSave.Product = undefined;


        this.productVariationService.save(productVariationToSave);
    }

    remove(){
        if(this.object.allocatedInventory != null){
            return;
        }else{
            this.barcodeService.remove(this.object);

            if(this.parentDashboard == "barcodes"){
                this.barcodeService.list();
            } else {
                this.packageBarcodeNavigationService.viewPackageProduct(this.selectedPackageId);
            }
        }
    }

    generateBarcode(){

        this.barcodeService.generateBarcode()
            .then(barcodeString => {
                this.object.barcode = barcodeString;
            })
            .catch(err => {
                console.log("err: ");
                console.log(err);
            });

    }

    allocate(){
        this.barcodeNavigationService.allocateInventory(this.object, this.selectedPackageId);
    }

    viewAllocation(){
        this.barcodeNavigationService.viewAllocation(this.object, this.selectedPackageId);
    }

    printBarcodes(){

        let dialogRef = this.dialog.open(PrintBarcodeModalComponent, {
            width: '300px',
            height: '280px',
            data: { printType: 'barcode' }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            console.log(result); // result will be pass as an int if it's valid.

            if (result) {
                this.barcodeService.printBarcodes(this.object.barcode, result)
                    .then(s3Link => {

                        console.log("Received: " + s3Link);
                        let $body = $(this.overlayRoot.nativeElement);
                        let iframe = `<iframe src="${s3Link}" style="display: none;"/>`;
                        $(iframe).appendTo($body);

                    })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    })
            }
        })
    }

    printBarcodeLabels(printType = 'barcode'){

        let dialogRef = this.dialog.open(PrintBarcodeModalComponent, {
            width: '300px',
            height: '280px',
            data: { printType: printType }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            console.log(result); // result will be pass as an int if it's valid.

            if (result) {
                let barcodeToSend = new Barcode(this.object);
                let packageToSend = new Package(this.object.Packages[0]);

                barcodeToSend.Items = [];
                barcodeToSend.Packages = [];

                let productVariationToSend = new ProductVariation(this.object.ProductVariation);

                barcodeToSend.ProductVariation = productVariationToSend;

                productVariationToSend.Items = [];

                let type = this.object.ProductVariation.Product.ProductType.category;

                productVariationToSend.Product = new Product(this.object.ProductVariation.Product);

                productVariationToSend.Product.Item = undefined;
                productVariationToSend.Product.ProductVariations = [];
                productVariationToSend.Product.PricingTier = undefined;
                productVariationToSend.Product.ProductType = undefined;

                console.log(barcodeToSend);
                console.log(productVariationToSend);
                if (printType != 'flower') {
                    this.printerService.printBarcodeLabels(barcodeToSend, productVariationToSend, packageToSend, type, result);
                } else {
                    this.printerService.printBulkFlowerBarcodeLabels(this.store, barcodeToSend, productVariationToSend, packageToSend, result);
                }
            }
        });
    }

    private _selectedProductTypeId: string;
    get selectedProductTypeId() {
        return this._selectedProductTypeId;
    }
    set selectedProductTypeId(newValue: string) {
        this._selectedProductTypeId = newValue;
        
        this.productSelect2SearchArgs.productTypeId = newValue;
        this.productDisabled = !newValue;
        this.selectedProductId = '';
        this.selectedProductVariationId = '';
        this.productVariation = undefined;
        this.selectedProductTypeIdSource.next(newValue);
    }

    private _selectedProductId: string;
    get selectedProductId() {
        return this._selectedProductId;
    }
    set selectedProductId(newValue: string) {
        this._selectedProductId = newValue;
        this.productVariationSelect2SearchArgs.productId = newValue;
        this.productVariationDisabled = !newValue;
        this.selectedProductVariationId = '';
        this.productVariation = undefined;
        this.selectedProductIdSource.next(newValue);
    }

    private _selectedProductVariationId: string;
    get selectedProductVariationId() {
        return this._selectedProductVariationId;
    }
    set selectedProductVariationId(newValue: string) {
        this._selectedProductVariationId = newValue;
        this.selectedProductVariationIdSource.next(newValue);
    }

    showBarcodeNextVariationForm() {
        this.showingBarcodeNextVariationForm = true;
        this.showingBarcodeNextPackageForm = false;

        setTimeout(() => {
            this.overlayRoot.nativeElement.scrollTop = this.overlayRoot.nativeElement.scrollHeight;
        },10);
    }

    showBarcodeNextPackageForm() {
        this.showingBarcodeNextVariationForm = false;
        this.showingBarcodeNextPackageForm = true;

        setTimeout(() => {
            this.overlayRoot.nativeElement.scrollTop = this.overlayRoot.nativeElement.scrollHeight;
        },10);
    }

    hideBarcodeNextForms(){
        this.showingBarcodeNextVariationForm = false;
        this.showingBarcodeNextPackageForm = false;
    }

    barcodeNextVariation(){
        if(!this.nextVariationIdToBarcode){
            this.errorFlags.nextVariationToBarcode = true;

            return;
        }

        this.productVariationService.get(this.nextVariationIdToBarcode).first().toPromise().then((productVariation: IProductVariation) => {
            this.packageService.getAssociated(this.selectedPackageId).first().toPromise().then((_package: IPackage) => {

                this.packageBarcodeNavigationService.createFromProductVariation(productVariation, _package);
            });
        });
    }

    barcodeNextPackage(){
        if(!this.nextPackageIdToBarcode){
            this.errorFlags.nextPackageToBarcode = true;

            return;
        }

        this.packageBarcodeNavigationService.viewPackageDetails(this.nextPackageIdToBarcode);
    }
}
