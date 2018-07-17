import {Component, OnDestroy, OnInit} from "@angular/core";
import {PosCartService} from "../services/pos-cart.service";
import {BarcodeService} from "../services/barcode.service";
import {PackageService} from "../services/package.service";
import {ReceiptService} from "../services/receipt.service";
import {DrawerService} from "../services/drawer.service";
import {IUser} from "../models/interfaces/user.interface";
import {UserService} from "../services/user.service";
import {TimeClockService} from "../services/time-clock.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {PosTimeClockComponent} from "./pos-time-clock/pos-time-clock.component";
import {ScaleService} from "../services/scale.service";
import {Subscription} from "rxjs/Subscription";
import {PatientService} from "../services/patient.service";

import {environment} from "../../environments/environment";

@Component({
    selector: 'app-pos',
    templateUrl: './pos.component.html'
})
export class PosComponent implements OnInit, OnDestroy {

    isNavShowing = true;
    isRefundDetailModalShowing = false;
    isManagerApprovalModalShowing = false;
    isAgeVerificationModalShowing = false;
    isVoidDetailModalShowing = false;
    isDrawerStartModalShowing = false;
    isDrawerEndModalShowing = false;
    isOversaleLimitModalShowing = false;
    isPatientOversaleLimitModalShowing = false;
    isDeviceRegistrationModalShowing = false;
    isTransactionCompletedModalShowing = false;
    isExplainDrawerNavigationModalShowing = false;
    isCustomDiscountModalShowing = false;
    isBulkFlowerModalShowing = false;
    isReceiptVoidModalShowing = false;
    isPinEntryModalShowing = false;
    isPreviousPurchasesModalShowing = false;
    isPatientIDModalShowing = false;
    isPatientNotesModalShowing = false;
    isAssignPatientToPatientGroupModalShowing = false;

    userSubscription: Subscription;
    timeClockSubscription: Subscription;
    routerSubscription: Subscription;
    barcodeSubscription: Subscription;

    user: IUser;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private barcodeService: BarcodeService,
        private cartService: PosCartService,
        private packageService: PackageService,
        private userService: UserService,
        private receiptService: ReceiptService,
        private drawerService: DrawerService,
        private timeClockService: TimeClockService,
        private patientService: PatientService
    ){
    }

    ngOnInit() {

        this.userSubscription = this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });

        this.timeClockSubscription = this.timeClockService.refreshEmitted
            .subscribe(() => {
                this.userService.userEmitted.take(1).subscribe(user => {
                    this.timeClockService.getMostRecentActiveForUser(user.id)
                        .subscribe((timeClock) => {
                            if(!timeClock){
                                //Redirect to time clock page
                                this.timeClockService.goToPosClockIn();
                            }
                        })
                });
            });

        this.routerSubscription = this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .subscribe(route => {
                if(!(route.component instanceof PosTimeClockComponent)){
                    if(this.user) {
                        this.timeClockService.getMostRecentActiveForUser(this.user.id)
                            .subscribe((timeClock) => {
                                if (!timeClock) {
                                    //Redirect to time clock page
                                    this.timeClockService.goToPosClockIn();
                                }
                            })
                    }
                }
            })

        this.barcodeSubscription = this.barcodeService.scanEmitted.subscribe((tag) => {

            this.barcodeService.getByBarcodeString(tag).subscribe(barcodeObservable => {
                barcodeObservable.take(1).subscribe(barcode => {

                    let packages = barcode.Packages;
                    let productVariation = barcode.ProductVariation;

                    console.log("From barcode scan");

                    if(productVariation.isBulkFlower && environment.bulkFlowerMode){
                        console.log("BULK FLOWER");
                        this.cartService.emitBulkFlowerInformation({productVariation, packages, barcode});
                        this.cartService.showBulkFlowerModal();
                    }else{
                        this.cartService.addProductVariationToCart(productVariation, packages, barcode.id);
                    }

                })
            })

        });

        this.drawerService.drawerStartModalShowing.subscribe(val => {
            this.isDrawerStartModalShowing = val;
        });

        this.drawerService.drawerEndModalShowing.subscribe(val => {
            this.isDrawerEndModalShowing = val;
        });

        this.drawerService.explainDrawerNavigationShowing.subscribe(val => {
            this.isExplainDrawerNavigationModalShowing = val;
        });

        this.receiptService.voidDetailModalShowing.subscribe(val => {
            this.isVoidDetailModalShowing = val;
        });

        this.cartService.refundDetailModalShowing.subscribe(val => {
            this.isRefundDetailModalShowing = val;
        });

        this.cartService.managerApprovalModalShowing.subscribe(val => {
            this.isManagerApprovalModalShowing = val;
        });

        this.cartService.ageVerificationModalShowing.subscribe(val => {
            this.isAgeVerificationModalShowing = val;
        });

        this.cartService.oversaleLimitModalShowing.subscribe(val => {
            this.isOversaleLimitModalShowing = val;
        });

        this.cartService.patientOversaleLimitModalShowing.subscribe(val => {
            this.isPatientOversaleLimitModalShowing = val;
        });

        this.cartService.deviceRegistrationModalShowing.subscribe(val => {
            this.isDeviceRegistrationModalShowing = val;
        })

        this.cartService.transactionCompletedModalShowing.subscribe(val => {
            this.isTransactionCompletedModalShowing = val;
        });

        this.cartService.customDiscountModalShowing.subscribe(val => {
            this.isCustomDiscountModalShowing = val;
        });

        this.cartService.bulkFlowerModalShowing.subscribe(val => {
            this.isBulkFlowerModalShowing = val;
        })

        this.cartService.receiptVoidModalShowing.subscribe(val => {
            this.isReceiptVoidModalShowing = val;
        });

        this.cartService.pinEntryModalShowing.subscribe(val => {
            this.isPinEntryModalShowing = val;
        });

        this.patientService.previousPurchasesModalShowing.subscribe(val => {
            this.isPreviousPurchasesModalShowing = val;
        });

        this.patientService.patientIDModalShowing.subscribe(val => {
            this.isPatientIDModalShowing = val;
        });

        this.patientService.patientNotesModalShowing.subscribe(val => {
            this.isPatientNotesModalShowing = val;
        });

        this.cartService.assignPatientToPatientGroupModalShowing.subscribe(val => {
            this.isAssignPatientToPatientGroupModalShowing = val;
        });
    }

    ngOnDestroy(){
        this.userSubscription && this.userSubscription.unsubscribe();
        this.timeClockSubscription && this.timeClockSubscription.unsubscribe();
        this.routerSubscription && this.routerSubscription.unsubscribe();
        this.barcodeSubscription && this.barcodeSubscription.unsubscribe();
    }

    showNav() {
        this.isNavShowing = true;
    }

    hideNav() {
        this.isNavShowing = false;
    }

}
