import {Component, Injector, OnInit, ViewChild, ElementRef} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from 'rxjs/Rx';
import {IPackage} from "../../../../models/interfaces/package.interface";
import {IProduct} from "../../../../models/interfaces/product.interface";
import {IItem} from "../../../../models/interfaces/item.interface";
import {IPackageExtract} from "../../../../models/interfaces/package-extract.interface";
import {IPackageConversion} from "../../../../models/interfaces/package-conversion.interface";
import {Observable} from "rxjs/Observable";
import {ObjectObservable} from "../../../../lib/object-observable";
import {PackageService} from "../../../../services/package.service";
import {ProductService} from "../../../../services/product.service";
import {ItemService} from "../../../../services/item.service";
import {SupplierService} from "../../../../services/supplier.service";
import {ISupplier} from "../../../../models/interfaces/supplier.interface";
import {Package} from "../../../../models/package.model";
import {PackageConversion} from "../../../../models/package-conversion.model";
import {PackageConversionService} from "../../../../services/package-conversion.service";
import {ChangeDetectionStrategy } from '@angular/core';
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PackageUnusedLabelService} from "../../../../services/package-unused-label.service";
import {IPackageUnusedLabel} from "../../../../models/interfaces/package-unused-label.interface";

declare const $: any;

@Component({
    selector: 'app-package-conversion',
    templateUrl: './package-conversion.component.html',
    styleUrls: ['./package-conversion.component.css']
})
export class PackageConversionComponent implements OnInit{

    @ViewChild('stepper') stepper;

    step:number = 1;
    totalSteps:number = 2;
    linearWorkaround = {invalid : false};

    showingFullInPackages:boolean = false;

    packageObservable: Observable<IPackage>;
    packageSubscription : Subscription;

    inErrors:Array<string> = [];
    outErrors:Array<string> = [];
    errorFlags:any = {};
    serverError:string = "";

    protected router: Router;
    protected route: ActivatedRoute;

    primaryPackageId:string;
    primaryPackage:IPackage;

    maxOutDate:Date = new Date();

    packageConversion:IPackageConversion;

    inPackageLabelSelect2Options:Select2Options;
    outPackageLabelSelect2Options:Select2Options;
    outPackageItemSelect2Options:Select2Options;
    outPackageSupplierSelect2Options:Select2Options;

    outItem:IItem;
    outSupplier:ISupplier;
    outLabel:IPackageUnusedLabel;
    packageConversionAssignmentsSubscription : Subscription;

    maxDecimalPlaces:number = 5;

    newPackageId:string;

    constructor(
        injector: Injector,
        private packageService: PackageService,
        private packageConversionService: PackageConversionService,
        private productService: ProductService,
        private itemService: ItemService,
        private supplierService: SupplierService,
        private packageUnusedLabelService: PackageUnusedLabelService,
        private element: ElementRef
    ){
        this.router = injector.get(Router);
        this.route = injector.get(ActivatedRoute);
    }

    ngOnInit(){

        this.packageConversion = new PackageConversion();
        this.packageConversion.outDate = this.maxOutDate;

        if (!this.packageObservable) {
            this.packageObservable = Observable.combineLatest(this.route.params, this.route.data)
                .map(([params, data]) => {
                    this.primaryPackageId = params['id'];

                    return params['id'];
                })
                .switchMap((id: string|undefined) => {
                    return this.packageService.getAssociated(id, ['supplier', 'deliveryPackage', 'item']);
                });

            this.packageSubscription = this.packageObservable.subscribe(_package => {

                this.primaryPackage = _package;

                this.addInPackage(this.packageService.dbInstance(_package));

                this.assignSupplierId();

                CommonAdapter(this.packageService, 'id', 'Label', {UnitOfMeasureName: this.primaryPackage.UnitOfMeasureName, quantity : 1, quantityComparator : "gt"})
                .then((PackageAdapter) => {

                    this.inPackageLabelSelect2Options = {
                        ajax: {},
                        placeholder: 'Select Package to Add'
                    };

                    this.inPackageLabelSelect2Options['dataAdapter'] = PackageAdapter;
                });
            });
        }

        //Replace with new label options
        CommonAdapter(this.packageUnusedLabelService, 'id', 'Label')
            .then((PackageAdapter) => {

            this.outPackageLabelSelect2Options = {
                ajax: {},
                placeholder: 'Search New ID'
            };

            this.outPackageLabelSelect2Options['dataAdapter'] = PackageAdapter;
        });

        //Replace with new label options
        CommonAdapter(this.itemService, 'id', 'name')
            .then((ItemAdapter) => {

            this.outPackageItemSelect2Options = {
                ajax: {},
                placeholder: 'Search Item'
            };

            this.outPackageItemSelect2Options['dataAdapter'] = ItemAdapter;
        });

        CommonAdapter(this.supplierService, 'id', (supplier) => `${supplier.name} (${supplier.licenseNumber})`)
            .then((SupplierAdapter) => {

            this.outPackageSupplierSelect2Options = {
                ajax: {},
                placeholder: 'Search Supplier',
                allowClear: true
            };
            this.outPackageSupplierSelect2Options['dataAdapter'] = SupplierAdapter;
        });
    }

    clearErrors() {
        this.errorFlags = {};
        this.inErrors = [];
        this.outErrors = [];
    }

    toDashboard(){
        this.packageService.dashboard();
    }

    addInPackage(_package:IPackage, quantity?:number) {
        this.packageConversionService.addInPackageExtract(this.packageConversion, _package, quantity);
    }

    assignSupplierId() {
        if(!this.packageConversion.outSupplierId) {
            var highestQuantity = 0;
            var highestQuantitySupplierId = this.primaryPackage.supplierId;

            for(let inPackageExtract of this.packageConversion.inPackageExtracts){
                if((inPackageExtract._package.supplierId) && (highestQuantity == 0 || inPackageExtract.Quantity > highestQuantity)){
                    highestQuantity = inPackageExtract.Quantity;

                    highestQuantitySupplierId = inPackageExtract._package.supplierId;
                }
            }

            this.packageConversion.outSupplierId = highestQuantitySupplierId;
        }
    }

    inPackageChange(packageExtract:IPackageExtract, id){
        this.packageService.getAssociated(id, ['supplier', 'deliveryPackage']).first().subscribe(object => {
            packageExtract._package = object;

            this.packageConversionService.setInPackageProduct(packageExtract);
        });
    }

    getTotalInQuantity() {
        return this.packageConversionService.getTotalInQuantity(this.packageConversion);
    }

    onCancel(){
        this.packageService.detailView(this.primaryPackage);
    }

    uploadNewIds() {
        document.documentElement.scrollTop = 0;

        //Show modal
        this.packageService.showUploadIdsModal();
    }

    validateStep1(){

        this.clearErrors();

        var valid = true;

        var missingPackagesCounter = 0;
        var invalidQuantitiesCounter = 0;
        var duplicatePackages = false;

        for(let inPackageExtract of this.packageConversion.inPackageExtracts){

            inPackageExtract.Quantity = Math.round(inPackageExtract.Quantity * (Math.pow(10, this.maxDecimalPlaces))) / (Math.pow(10, this.maxDecimalPlaces));

            if(!inPackageExtract._package){
                this.errorFlags[inPackageExtract.id + "_package"] = true;
                missingPackagesCounter++;
            }

            if(inPackageExtract._package && ((inPackageExtract._package.Quantity - inPackageExtract.Quantity) < 0 || inPackageExtract.Quantity <= 0)){
                this.errorFlags[inPackageExtract.id + "_quantity"] = true;
                invalidQuantitiesCounter++;
            }

            var counter = 0;

            for(let inPackageExtractCheck of this.packageConversion.inPackageExtracts){
                if(inPackageExtractCheck._package && inPackageExtract._package && (inPackageExtractCheck._package.id == inPackageExtract._package.id)){
                    counter++;

                    if(counter > 1) {
                        this.errorFlags[inPackageExtract.id + "_package"] = true;

                        duplicatePackages = true;
                    }
                }
            }
        }

        if(duplicatePackages){
            this.inErrors.push("Ensure all packages are unique.");
            valid = false;
        }

        if(missingPackagesCounter > 0) {
            this.inErrors.push("Ensure you have selected all packages to add.");
            valid = false;
        }

        if(invalidQuantitiesCounter > 0) {
            this.inErrors.push("Ensure all transfer quantities are valid.");
            valid = false;
        }

        return valid;
    }

    validateStep2() {

        this.clearErrors();

        var valid = true;

        if(!this.packageConversion.outPackageLabel){
            this.errorFlags["outpackage"] = true;
            this.outErrors.push("Select a package tag.");
            valid = false;
        }

        if(!this.packageConversion.outItemId){
            this.errorFlags["outitem"] = true;
            this.outErrors.push("Select an item.");
            valid = false;
        }

        if(!this.packageConversion.outDate || (this.packageConversion.outDate > new Date())){
            this.errorFlags["outdate"] = true;
            this.outErrors.push("Select a created date.");
            valid = false;
        }

        if(!this.packageConversion.outSupplierId){
            this.errorFlags["outsupplier"] = true;
            this.outErrors.push("Select a supplier.");
            valid = false;
        }

        return valid;
    }

    prepareConfirmation() {

        this.packageConversionAssignmentsSubscription = Observable.combineLatest(
            this.itemService.get(this.packageConversion.outItemId),
            this.supplierService.get(this.packageConversion.outSupplierId),
            this.packageUnusedLabelService.get(this.packageConversion.outPackageLabel)
        ).subscribe(([item, supplier, outLabel]) => {
            console.log(item);

            this.outItem = item;
            this.outSupplier = supplier;
            this.outLabel = outLabel;
        });
    }

    onConfirm() {
        document.documentElement.scrollTop = 0;

        this.packageConversionService.submitPackageConversion(this.packageConversion).then((newPackageId) => {
            this.serverError = "";
            this.newPackageId = newPackageId;
            this.nextStep();
        }).catch((err) => {
            if(err.message) {
                this.serverError = err.message;
            } else {
                this.serverError = "There was a problem creating this package.";
            }
        })
    }

    removeInPackageExtract(inPackageExtract) {
        this.packageConversionService.removeInPackageExtractById(this.packageConversion, inPackageExtract.id);
    }

    ngOnDestroy () {
        if (this.packageSubscription) {
            this.packageSubscription.unsubscribe();
        }
    }

    filterNumericKeyPress (e){

        var key = e.keyCode ? e.keyCode : e.which;

        if (key < 48 || key > 57) e.preventDefault();
    }

    filterDecimalKeyPress (e, allowDecimal){

        var key = e.keyCode ? e.keyCode : e.which;

        if ((key < 48 || key > 57) && (key != 46 || !allowDecimal)) e.preventDefault();
    }

    setInPackageQuantity($event, inPackage) {
        if($event) {
            inPackage.Quantity = parseFloat($event);
        } else {
            inPackage.Quantity = 0;
        }

        this.assignSupplierId();
    }

    toDetails(){
        this.packageService.detailView(this.primaryPackage);
    }

    viewNewPackage(){
        this.packageService.detailViewById(this.newPackageId);
    }

    previousStep() {

        this.outItem = null;
        this.outSupplier = null;

        this.step--;

        this.stepper.selectedIndex = this.step - 1;
    }

    nextStep() {
        document.documentElement.scrollTop = 0;

        if(this.step == 1) {
            if(!this.validateStep1()){
                return;
            }
        } if(this.step == 2) {
            if(!this.validateStep2()){
                return;
            } else {
                this.prepareConfirmation();
            }
        }

        this.step++;

        this.stepper.selectedIndex = this.step - 1;
    }

    toggleFullInPackagesDisplay() {
        if(this.showingFullInPackages) {
            this.showingFullInPackages = false;
        } else {
            this.showingFullInPackages = true;
        }
    }
}
