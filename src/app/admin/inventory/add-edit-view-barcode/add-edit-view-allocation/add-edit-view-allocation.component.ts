import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {IBarcode} from "../../../../models/interfaces/barcode.interface";
import {Component, Injector, OnDestroy, OnInit} from "@angular/core";
import {BarcodeService} from "../../../../services/barcode.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ProductTypeService} from "../../../../services/product-type.service";
import {ProductService} from "../../../../services/product.service";
import {ProductVariationService} from "../../../../services/product-variation.service";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {Observable} from "rxjs/Observable";
import {IProductVariation} from "../../../../models/interfaces/product-variation.interface";
import {PackageService} from "../../../../services/package.service";
import {Item} from "../../../../models/item.model";
import {Package} from "../../../../models/package.model";
import {ActivatedRoute, Router} from "@angular/router";
import {Barcode} from "../../../../models/barcode.model";
import {ProductVariation} from "../../../../models/product-variation.model";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {Subscription} from "rxjs/Subscription";
import {BarcodeNavigationService} from "../../../../services/barcode-navigation.service";
import {PackageBarcodeNavigationService} from "../../../../services/package-barcode-navigation.service";

@Component({
    selector: 'app-add-edit-view-allocation',
    templateUrl: './add-edit-view-allocation.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewAllocationComponent implements OnInit, OnDestroy {

    mode: 'add' | 'view';

    router: Router;
    route: ActivatedRoute;

    barcodeObservable: Observable<IBarcode>;

    barcode: IBarcode;

    errors: string[] = [];

    itemsPackagesMap;

    quantityErrors = {};

    barcodeSubscription: Subscription;

    selectedPackageId: string;

    parentDashboard: string;

    barcodeNavigationService: BarcodeNavigationService;

    constructor(injector: Injector, private barcodeService: BarcodeService, private packageService: PackageService, private packageBarcodeNavigationService : PackageBarcodeNavigationService){
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit(){

        this.route.data.subscribe((data) => {
            this.parentDashboard = data.parentDashboard;

            if(this.parentDashboard == "barcodes"){
                this.barcodeNavigationService = this.barcodeService;
            } else {
                this.barcodeNavigationService = this.packageBarcodeNavigationService;

                //Get the params of the package details component to get the package id
                this.route.parent.parent.params.subscribe((params) => {
                    this.selectedPackageId = params.id;
                });               
            }
        });

        this.barcodeObservable = Observable.combineLatest(this.route.parent.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string) => {
                return this.barcodeService.getAssociated(id);
            });

        this.barcodeSubscription = this.barcodeObservable.subscribe(barcode => {

            if(this.barcode) {
                //TODO dirty check
            }

            this.itemsPackagesMap = {};

            this.barcode = barcode;
            this.barcode.Items.forEach(item => {
                let packages = item.Packages;

                //For each package in packages, find if this package id is in barcode.Packages
                for(let _package of packages){
                    let id = _package.id;
                    for(let selectedPackage of this.barcode.Packages){
                        if(id == selectedPackage.id){
                            this.itemsPackagesMap[item.id] = selectedPackage;
                        }
                    }
                }
            });

        })

    }

    ngOnDestroy(){
        this.barcodeSubscription && this.barcodeSubscription.unsubscribe();
    }

    save(){

        //On save unsubscribe
        this.barcodeSubscription && this.barcodeSubscription.unsubscribe();

        let errors = [];
        for(let item of this.barcode.ProductVariation.Items){
            let itemQuantity = item.ProductVariationItem.quantity;
            let allocatedQuantity = itemQuantity * this.barcode.allocatedInventory;
            if(allocatedQuantity - this.itemsPackagesMap[item.id].availableQuantity > 0.0001){
                let errorString = "The allocated quantity of " + item.name + " cannot exceed the available inventory for that package";
                errors.push(errorString);
                this.quantityErrors[item.id] = true;
            }

        }

        if(errors.length){
            this.errors = errors;
            return;
        }

        this.barcode.remainingInventory = this.barcode.allocatedInventory;

        for(let item of this.barcode.ProductVariation.Items){
            let itemQuantity = item.ProductVariationItem.quantity;
            let allocatedQuantity = itemQuantity * this.barcode.allocatedInventory;
            let _package = this.itemsPackagesMap[item.id];
            _package.availableQuantity -= allocatedQuantity;
            this.packageService.save(_package);
        }

        this.barcodeService.save(this.barcode, () =>{
            this.barcodeNavigationService.view(this.barcode, this.selectedPackageId);
        });
    }

    deleteAllocation(){

        //On save unsubscribe
        this.barcodeSubscription && this.barcodeSubscription.unsubscribe();

        let confirmed = confirm("Are you sure you want to delete this allocation?");

        if(confirmed) {
            for (let item of this.barcode.ProductVariation.Items) {
                let itemQuantity = item.ProductVariationItem.quantity;
                let deallocatedQuantity = itemQuantity * this.barcode.remainingInventory;
                let _package = this.itemsPackagesMap[item.id];
                _package.availableQuantity += deallocatedQuantity;
                this.packageService.save(_package);
            }

            this.barcode.allocatedInventory = null;
            this.barcode.remainingInventory = null;


            this.barcodeService.save(this.barcode, () =>{
                this.barcodeNavigationService.view(this.barcode, this.selectedPackageId);
            });
        }
    }

    scaleMode(){
        this.barcodeNavigationService.scaleAllocation(this.barcode, this.selectedPackageId);
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            if(this.barcode) {
                this.barcodeNavigationService.view(this.barcode, this.selectedPackageId);
            } else {
                this.barcodeService.list();
            }
        }
    }
}
