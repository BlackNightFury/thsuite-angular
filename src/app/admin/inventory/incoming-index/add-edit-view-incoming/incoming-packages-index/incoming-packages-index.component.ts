import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ITransfer} from "../../../../../models/interfaces/transfer.interface";
import {TransferService} from "app/services/transfer.service";
import {IPackage} from "../../../../../models/interfaces/package.interface";
import {PackageService} from "../../../../../services/package.service";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {IPackagePriceAdjustment} from "../../../../../models/interfaces/package-price-adjustment.interface";
import {PackagePriceAdjustmentService} from "../../../../../services/package-price-adjustment.service";
import {IDeliveryPackage} from "../../../../../models/interfaces/delivery-package.interface";
import {UserService} from "../../../../../services/user.service";
import {IUser} from "../../../../../models/interfaces/user.interface";

@Component({
    selector: 'app-incoming-packages-index',
    templateUrl: './incoming-packages-index.component.html',
    styleUrls: ['./incoming-packages-index.component.css'],
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class IncomingPackagesIndexComponent implements OnInit {

    user: IUser;

    transferObservable: Observable<ITransfer>;

    transfer: ITransfer;

    packages: IDeliveryPackage[];

    priceAdjustment: IPackagePriceAdjustment;
    priceAdjustmentShowing: boolean = false;
    adjustmentErrors: string[];

    errorFlags: {
        amount: boolean;
        reason: boolean;
    } = {
        amount: false,
        reason: false
    };

    constructor(private router: Router, private route: ActivatedRoute,
                private transferService: TransferService,
                private packageService: PackageService,
                private packagePriceAdjustmentService: PackagePriceAdjustmentService,
                private userService: UserService) {
    }

    ngOnInit() {

        this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.transferObservable = this.route.parent.params
            .map((params) => params['id'])
            .switchMap((id: string) => {
                return this.transferService.getAssociated(id);
            });

        this.transferObservable.subscribe(transfer => {

            if(this.transfer) {
                //TODO dirty check
            }

            this.transfer = transfer;
            this.transferService.packagesForTransfer(this.transfer, 'incoming')
                .then(transfers => {
                    let transfer = transfers[0]; //Will only ever be a single transfer
                    let delivery = transfer.Deliveries[0]; //Incoming transfers only have one delivery
                    this.packages = delivery.DeliveryPackages;
                }).catch(err => {
                    console.log(err);
            });
        })
    }

    viewPackage(_package: IPackage) {
        this.router.navigate(['view', _package.id], {relativeTo: this.route});
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
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

        let perPackageAdjustmentAmount = this.priceAdjustment.amount / this.packages.length;

        for(let _package of this.packages){
            let packageId = _package.packageId;
            //this.priceAdjustment is the master adjustment
            let adjustment = this.packagePriceAdjustmentService.newInstance();
            adjustment.userId = this.user.id;
            adjustment.packageId = packageId;
            adjustment.amount = perPackageAdjustmentAmount;
            adjustment.reason = this.priceAdjustment.reason;
            adjustment.notes = this.priceAdjustment.notes;
            adjustment.date = new Date();

            this.packagePriceAdjustmentService.save(adjustment);
        }

        this.priceAdjustmentShowing = false;
        //Clear the adjustment
        this.priceAdjustment = this.packagePriceAdjustmentService.newInstance();

    }

    cancelPriceAdjustment(){
        this.priceAdjustmentShowing = false;
        this.adjustmentErrors = [];
        this.clearErrorFlags();
        this.priceAdjustment.amount = 0;
        this.priceAdjustment.reason = '';
        this.priceAdjustment.notes = '';
    }


    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['..'], {relativeTo: this.route})
        }
    }
}
