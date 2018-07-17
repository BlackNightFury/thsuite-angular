import {Component, OnInit, ViewChild, ElementRef, Injector} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ItemService} from "../../../../../../services/item.service";
import {IItem} from "../../../../../../models/interfaces/item.interface";
import {IPackage} from "../../../../../../models/interfaces/package.interface";
import {PackageService} from "../../../../../../services/package.service";
import {Package} from "../../../../../../models/package.model";
import {AdjustmentService} from "../../../../../../services/adjustment.service";
import {PurchaseOrderService} from "../../../../../../services/purchase-order.service";
import {Adjustment} from "../../../../../../models/adjustment.model";
import {IAdjustment} from "../../../../../../models/interfaces/adjustment.interface";
import {IPurchaseOrder} from "../../../../../../models/interfaces/purchase-order.interface";
import {IPackagePriceAdjustment} from "../../../../../../models/interfaces/package-price-adjustment.interface";
import {PackagePriceAdjustmentService} from "../../../../../../services/package-price-adjustment.service";
import {UserService} from "../../../../../../services/user.service";
import {IUser} from "../../../../../../models/interfaces/user.interface";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {AddEditViewObjectComponent} from "../../../../../../util/add-edit-view-object.component";
import {AdjustmentReasonService} from "../../../../../../services/adjustment-reasons.service";

declare const $;

@Component({
    selector: 'app-add-edit-view-package',
    templateUrl: './add-edit-view-package.component.html',
    styleUrls: ['./add-edit-view-package.component.css'],
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewPackageComponent extends AddEditViewObjectComponent<IPackage> implements OnInit  {
    @ViewChild('root')overlayRoot: ElementRef;

    user: IUser;
    // mode: string = 'add';

    itemObservable: Observable<IItem>;
    packageObservable: Observable<IPackage>;

    item: IItem;
    _package: IPackage;

    errors: string[];
    adjustmentErrors: string[];

    errorFlags: {
        wholesale: boolean;
        label: boolean;
        quantity: boolean;
        amount: boolean;
        reason: boolean;
    } = {
        wholesale: false,
        label: false,
        quantity: false,
        amount: false,
        reason: false
    };

    adjustmentShowing: boolean = false;
    adjustmentOptions: Select2Options;

    adjustment: IAdjustment;

    priceAdjustmentShowing: boolean = false;

    priceAdjustment: IPackagePriceAdjustment;

    purchaseOrder: IPurchaseOrder;

    wholesalePerUnitPlaceholder: string;

    constructor(
        private injector: Injector,
        private itemService: ItemService,
        private packageService: PackageService,
        private adjustmentService: AdjustmentService,
        private packagePriceAdjustmentService: PackagePriceAdjustmentService,
        private purchaseOrderService: PurchaseOrderService,
        private adjustmentReasonService: AdjustmentReasonService
    ) {
        super(injector, packageService);
    }


    ngOnInit() {

        this.adjustment = this.adjustmentService.newInstance();
        this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();
        this.purchaseOrder = this.purchaseOrderService.newInstance();

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.itemObservable = this.route.parent.parent.params.map(params => params['id'])
            .switchMap((id: string) => {
                return this.itemService.get(id);
            });

        this.itemObservable.subscribe(item => {

            if(this.item) {
                //TODO dirty check
            }

            this.item = item;

            this.purchaseOrder.itemId = this.item.id;

            if( this._package ) {
                window.requestAnimationFrame( function() { $('input[type="number"]').on('mousewheel', function(e){ $(this).blur(); }) } )
            }
        });

        this.packageObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                console.log(this.mode);

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                console.log("Loading productVariation with id: " + id);
                return id ? this.packageService.getAssociated(id) : Observable.of(this.packageService.newInstance())
            });
        this.packageObservable.subscribe(_package=> {

            if (this._package) {
                //TODO dirty check
            }

            console.log(_package);

            this._package = new Package(_package);

            console.log(this._package);
            this.wholesalePerUnitPlaceholder = "Per " + (this._package.UnitOfMeasureName == "Grams" ? "Gram" : "Unit") + " Wholesale Price";
            this.adjustment.packageId = this._package.id;
            this.priceAdjustment.packageId = this._package.id;
            this.purchaseOrder.packageId = this._package.id;

            if( this.item ) {
                window.requestAnimationFrame( function() { $('input[type="number"]').on('mousewheel', function(e){ $(this).blur(); }) } )
            }

        });

        this.adjustmentOptions = this.adjustmentReasonService.getAdjustmentReasons();

    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    updatePackagePerUnitWholesalePrice(event: any) {
        if (this._package) {
            this._package.perUnitWholesalePrice = Math.round(parseFloat(event.target.value) / this._package.ReceivedQuantity*100) / 100;
            if(isNaN(this._package.perUnitWholesalePrice)){
                this._package.perUnitWholesalePrice = 0;
            }
        }
    }

    updatePackageWholesalePrice(event: any) {
        if (this._package) {
            this._package.wholesalePrice = Math.round(parseFloat(event.target.value) * this._package.ReceivedQuantity*100) / 100;
        }
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

        //Set the date
        this.adjustment.date = new Date();
        this.adjustment.userId = this.user.id;

        this.adjustmentService.save(this.adjustment);
        //Adjust package quantity and save
        this._package.Quantity += this.adjustment.amount;
        // this._package.Adjustments.push(this.adjustment);

        this.packageService.save(this._package);

        this.adjustmentShowing = false;
        //Clear the adjustment
        this.adjustment = this.adjustmentService.newInstance();
        this.adjustment.packageId = this._package.id;
    }

    cancelAdjustment(){
        this.adjustmentShowing = false;
        this.errors = [];
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

        this.packagePriceAdjustmentService.save(this.priceAdjustment);

        //Save package
        this.packageService.save(this._package);

        this.priceAdjustmentShowing = false;
        //Clear the adjustment
        this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();
        this.priceAdjustment.packageId = this._package.id;
    }

    cancelPriceAdjustment(){
        this.priceAdjustmentShowing = false;
        this.errors = [];
        this.clearErrorFlags();
        this.priceAdjustment.amount = 0;
        this.priceAdjustment.reason = '';
        this.priceAdjustment.notes = '';
    }

    expandRow(row){
        let $row = $(row);

        $row.siblings().not('.adjustment-detail-row').addClass('hide-next');
        $row.removeClass('hide-next');
    }


    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            // this.packageService.list(this.item);
            if(this.mode != 'add'){
                this.router.navigate(["../.."], {relativeTo: this.route});
            }else{
                this.router.navigate(['..'], {relativeTo: this.route});
            }
        }
    }

    save() {
        this.errorFlags.wholesale = false;
        let errors = [];

        if(this.mode == 'add'){

            if(!this._package.Label){
                errors.push("Package Label cannot be blank.");
                this.errorFlags.label = true;
            }

            if(!this._package.Quantity){
                errors.push("Package quantity cannot be empty or 0.");
                this.errorFlags.quantity = true;
            }

        }

        if(this._package.wholesalePrice !== 0 && !this._package.wholesalePrice){
            errors.push('Wholesale Price cannot be empty.');
            this.errorFlags.wholesale = true;
        }

        if(errors.length){
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return
        }

        this._package.itemId = this.item.id;

        if(this.mode == 'add'){
            this._package.MetrcId = 0;
            this._package.UnitOfMeasureName = "Each";
            this._package.UnitOfMeasureAbbreviation = 'ea';
            // this.item.Packages.push(this._package);
        }

        this.packageService.save(new Package(this._package));

        this.itemService.refresh(this.item);

        this.packageService.list(this.item);
    }

    private _shouldShowAddAdjustmentActions: boolean = false;
    shouldShowAddAdjustmentActions(){
        if (!this.item) return false;
        const isItemTHC = (this.item.MetrcId === 0 || this.item.MetrcId === null)

        if (this.adjustmentShowing || this.priceAdjustmentShowing || this.purchaseOrderShowing) return false;
        if (!isItemTHC) return true;

        return this._shouldShowAddAdjustmentActions;
    }
    shouldShowCancelAddAdjustment(){
        if (!this.item) return false;
        const isItemTHC = (this.item.MetrcId === 0 || this.item.MetrcId === null)

        if (this.adjustmentShowing || this.priceAdjustmentShowing || this.purchaseOrderShowing) return false;
        if (!isItemTHC) return false;

        return this._shouldShowAddAdjustmentActions;
    }

    shouldShowAddAdjustment(){
        if (this.adjustmentShowing || this.priceAdjustmentShowing || this.purchaseOrderShowing) return false;
        return !this.shouldShowAddAdjustmentActions()
    }
    showAddAdjustmentActions(){
        this._shouldShowAddAdjustmentActions = true;
    }
    hideAddAdjustmentActions(){
        this._shouldShowAddAdjustmentActions = false;
    }

    purchaseOrderShowing: boolean = false
    showPurchaseOrder(){
        this.purchaseOrderShowing = true;
    }
    cancelPurchaseOrder(){
        this.purchaseOrderShowing = false;
        this.errors = [];
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

        //Set the date
        this.purchaseOrder.date = new Date();
        this.purchaseOrder.userId = this.user.id;

        this.purchaseOrderService.save(this.purchaseOrder);
        //Adjust package quantity and save
        this._package.Quantity += this.purchaseOrder.amount;
        // this._package.Adjustments.push(this.adjustment);

        this.packageService.save(this._package);

        this.purchaseOrderShowing = false;
        //Clear the adjustment
        this.purchaseOrder = this.purchaseOrderService.newInstance();
        this.purchaseOrder.packageId = this._package.id;
        this.purchaseOrder.itemId = this._package.itemId;
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
}
