import {ActivatedRoute, Router} from "@angular/router";
import {IBarcode} from "../../../../../models/interfaces/barcode.interface";
import {Observable} from "rxjs/Observable";
import {Component, Injector, OnInit} from "@angular/core";
import {BarcodeService} from "../../../../../services/barcode.service";
import {PackageService} from "../../../../../services/package.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {ScaleService} from "../../../../../services/scale.service";
import {ProductVariation} from "../../../../../models/product-variation.model";
import {Barcode} from "../../../../../models/barcode.model";
import {Package} from "../../../../../models/package.model";
import {Item} from "../../../../../models/item.model";
import {AdjustmentService} from "../../../../../services/adjustment.service";
import {IUser} from "../../../../../models/interfaces/user.interface";
import {UserService} from "../../../../../services/user.service";

@Component({
    selector: 'app-scale-allocation',
    templateUrl: './scale-allocation.component.html',
    animations: [
        trigger('leave', [
            transition('inactive => active', [
                animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
            ])
        ])
    ]
})
export class ScaleAllocationComponent implements OnInit{
    mode: 'add' | 'view';

    user: IUser;

    router: Router;
    route: ActivatedRoute;

    barcodeObservable: Observable<IBarcode>;

    barcode: IBarcode;

    itemsPackagesMap;

    scaleReadings: {expected: string, read: string, difference: string}[] = [];

    productVariationWeight: number;

    errors: string[] = [];
    quantityErrors = {};

    constructor(injector: Injector, private barcodeService: BarcodeService, private userService: UserService, private packageService: PackageService, private adjustmentService: AdjustmentService, private scaleService: ScaleService){
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit(){

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.barcodeObservable = Observable.combineLatest(this.route.parent.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string) => {
                return this.barcodeService.getAssociated(id);
            });

        this.barcodeObservable.subscribe(barcode => {

            if(this.barcode) {
                //TODO dirty check
            }

            this.itemsPackagesMap = {};
            console.log(barcode);
            this.barcode = barcode;
            this.productVariationWeight = this.barcode.ProductVariation.quantity;
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

        });

        this.scaleService.scaleDataEmitted
            .subscribe(data => {
                console.log("Scale data received");
                console.log(data);
                let weight = data.weight;
                let difference = (this.productVariationWeight - weight).toFixed(2);

                this.scaleReadings.push(
                    {
                        expected: this.productVariationWeight + ' g',
                        read: weight + ' g',
                        difference: difference + ' g'
                    }
                );

                this.barcode.allocatedInventory = this.scaleReadings.length;
            })
    }

    deleteReading(index: number){
        this.scaleReadings.splice(index, 1);
        this.barcode.allocatedInventory = this.scaleReadings.length;
    }

    save(){

        //User can override validation
        let errors = [];
        for(let item of this.barcode.ProductVariation.Items){
            let itemQuantity = item.ProductVariationItem.quantity;
            let allocatedQuantity = itemQuantity * this.barcode.allocatedInventory;
            if(allocatedQuantity > this.itemsPackagesMap[item.id].availableQuantity){
                let errorString = "The allocated quantity of " + item.name + " cannot exceed the available inventory for that package. Clicking OK will proceed with saving, Cancel will stop saving.";
                this.quantityErrors[item.id] = true;
                let confirmed = confirm(errorString);
                if(!confirmed){
                    return;
                }
            }

        }

        let packageToAdjust;


        this.barcode.remainingInventory = this.barcode.allocatedInventory;

        for(let item of this.barcode.ProductVariation.Items){
            let itemQuantity = item.ProductVariationItem.quantity;
            let allocatedQuantity = itemQuantity * this.barcode.allocatedInventory;
            let _package = this.itemsPackagesMap[item.id];
            packageToAdjust = _package;
            _package.availableQuantity -= allocatedQuantity;
            this.packageService.save(_package);
        }

        //Note: The reason this is here is to avoid trying to save objects with
        //circular dependencies. Basically if it contains something like:
        // barcode.Packages and each element of Packages has Items which points back to packages in Packages
        //This code makes shallow copies of the objects and removes the unecessary fields so it can be saved.
        //Without this, there is a hasBinary overflow error
        let itemsToSave = [];
        let packagesToSave = [];
        for(let item of this.barcode.Items){
            let itemToSave = new Item(item);
            itemToSave.Packages = undefined;
            itemToSave.ProductType = undefined;
            itemToSave.Supplier = undefined;
            itemsToSave.push(itemToSave);
            //Need to add just the package that was selected
            for(let _package of this.barcode.Packages){
                let packageToSave = new Package(_package);
                packageToSave.Item = undefined;
                packagesToSave.push(packageToSave);
            }
        }

        let barcodeToSave = new Barcode(this.barcode);
        barcodeToSave.Items = itemsToSave;
        barcodeToSave.Packages = packagesToSave;
        barcodeToSave.ProductVariation = new ProductVariation(this.barcode.ProductVariation);
        barcodeToSave.ProductVariation.Items = undefined;
        barcodeToSave.ProductVariation.Product = undefined;

        this.barcodeService.save(barcodeToSave, () => {});

        //Create the adjustment
        let adjustment = this.adjustmentService.newInstance();
        adjustment.userId = this.user.id;
        adjustment.packageId = packageToAdjust.id;
        adjustment.amount = this.scaleReadings.reduce((sum, val) => {return sum + parseFloat(val.difference);}, 0);
        adjustment.reason = "Scale Variance";
        adjustment.notes = "Auto-calculated from barcode allocations using the scale.";
        adjustment.date = new Date();

        this.adjustmentService.save(adjustment);

        //Adjust package quantity and save
        packageToAdjust.Quantity += adjustment.amount;

        this.packageService.save(packageToAdjust);
    }

    animationStatus = 'inactive';

    startLeaving() {
        let confirmed = confirm('Are you sure you wish to leave this screen without saving? All weights read from the scale will be lost!');
        if(confirmed){
            this.animationStatus = 'active';
        }
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.barcodeService.view(this.barcode);
        }
    }
}
