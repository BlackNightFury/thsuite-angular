import {Component, Injector, OnInit} from "@angular/core";
// import * as moment from 'moment';
import * as moment from 'moment-timezone';
import {DrawerService} from "../../services/drawer.service";
import {IDrawer} from "../../models/interfaces/drawer.interface";
import {DrawerLogService} from "../../services/drawer-log.service";
import {DrawerRemovalService} from "../../services/drawer-removal.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {IUser} from "../../models/interfaces/user.interface";
import {UserService} from "../../services/user.service";
import {ReceiptService} from "../../services/receipt.service";
import {DeviceProxyService} from "../../services/device-proxy.service";
import {environment} from "../../../environments/environment";
import {PrinterService} from "../../services/printer.service";
import {StoreService} from "../../services/store.service";
import {IStore} from "../../models/interfaces/store.interface";
import {MdDialog} from "@angular/material";
import {PosCartService} from "../../services/pos-cart.service";
import {RemoveCashModalComponent} from "../../modals/remove-cash-modal/remove-cash-modal.component";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-pos-drawer',
    templateUrl: './pos-drawer.component.html',
    styleUrls: [ './pos-drawer.component.css' ]
})

export class PosDrawerComponent implements OnInit {

    public drawer: IDrawer;

    public history: any[];

    public isShowingAddEdit: boolean = false;

    public today: string = moment().toString();

    public user: IUser;
    public store: IStore;

    public isManagerPinEntryModalShowing: boolean = false;
    private managerPinModalSubscription: Subscription;
    private managerPinEntryResultSubscription: Subscription;
    private afterClosedCashRemovalDialogSubscription: Subscription;

    constructor(
        injector: Injector,
        private drawerService: DrawerService,
        private userService: UserService,
        private receiptService: ReceiptService,
        private deviceProxyService: DeviceProxyService,
        private drawerLogService: DrawerLogService,
        private drawerRemovalService: DrawerRemovalService,
        private printerService: PrinterService,
        private storeService: StoreService,
        private cartService: PosCartService,
        private dialog: MdDialog

    ){
        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            })
    }

    openCashRegister() {
        this.deviceProxyService.openDrawer();
    }

    ngOnInit() {

        this.userService.userEmitted.subscribe(user => this.user = user);

        this.checkCurrentDrawer();

        this.drawerService.checkDrawerEmitted.subscribe(val => {
            if(val){
                this.checkCurrentDrawer();
            }
        });

        this.cartService.managerPinEntryModalShowing.subscribe(val => {
            this.isManagerPinEntryModalShowing = val;
        });

        this.storeService.currentStoreEmitted.subscribe(store => this.store = store);

        this.managerPinModalSubscription = this.cartService.noSuccessfulManagerPinEntry.subscribe(closedWithNoSuccess => {
            if (closedWithNoSuccess){
                console.log("Cash Removed?: " + !closedWithNoSuccess);
                this.managerPinEntryResultSubscription && this.managerPinEntryResultSubscription.unsubscribe();
                this.afterClosedCashRemovalDialogSubscription && this.afterClosedCashRemovalDialogSubscription.unsubscribe();
            }
        })

    }

    checkCurrentDrawer(){
        console.log("checking current drawer");

        this.drawerService.getCurrent(true, localStorage.getItem('deviceId')).subscribe(drawer => {
            this.drawer = drawer;

            let history = [];

            if (drawer.startingAmount > 0) history.push({
                createdAt: drawer.createdAt,
                event: 'Drawer Started',
                cash: drawer.startingAmount,
                change: undefined
            })

            if (drawer.Receipts !== undefined) {
                drawer.Receipts.forEach(receipt => {
                    history.push({
                        createdAt: receipt.createdAt,
                        event: `Receipt: ${receipt.barcode} (${receipt.paymentMethod})`,
                        change: receipt.paymentMethod === 'cash' ? receipt.total : 0,
                        cash: undefined,
                        receipt
                    })
                })
            }

            if (drawer.DrawerRemovals !== undefined) {
                drawer.DrawerRemovals.forEach(drawerRemoval => {
                    history.push({
                        createdAt: drawerRemoval.createdAt,
                        event: `Drawer Removal: Approved By ${drawerRemoval.User.firstName} ${drawerRemoval.User.lastName}`,
                        change: drawerRemoval.removedAmount * -1,
                        cash: undefined,
                        drawerRemoval
                    })
                })

            }

            if (drawer.Log) {
                history = history.concat(
                    drawer.Log.map(logItem => ({
                        createdAt: logItem.createdAt,
                        event: logItem.event,
                        change: 0,
                        cash: undefined
                    }))
                ).sort((a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf())
            }

            let drawerAmount = drawer.startingAmount;

            history.slice(1).forEach(datum => {
                drawerAmount += datum.change;
                datum.cash = drawerAmount;
            });

            history.reverse();

            this.history = history;

        });
    }

    seeReceipts() {
        this.receiptService.list()
    }

    removeCash() {
        let dialogRef = this.dialog.open(RemoveCashModalComponent, {
            width: '400px',
            height: '435px',
            data: { currentBalance: this.drawer.currentBalance }
        });

        this.afterClosedCashRemovalDialogSubscription = dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log("Cash Removed: " + result);

                const newBalance = this.drawer.currentBalance - result;

                this.cartService.showManagerPinEntryModal();

                this.managerPinEntryResultSubscription = this.cartService.managerPinEntryResult.subscribe(userId => {
                    if (userId) {
                        let newDrawerRemoval = this.drawerRemovalService.newInstance();
                        newDrawerRemoval.drawerId = this.drawer.id;
                        newDrawerRemoval.userId = userId.toString();
                        newDrawerRemoval.removedAmount = result;

                        this.drawerRemovalService.save(newDrawerRemoval);

                        this.userService.get(userId).subscribe(User => {
                            newDrawerRemoval.User = User;
                            newDrawerRemoval.createdAt = moment.utc();
                            this.drawer.DrawerRemovals.push(newDrawerRemoval);

                            this.history.push({
                                createdAt: newDrawerRemoval.createdAt,
                                event: `Drawer Removal: Approved By ${newDrawerRemoval.User.firstName} ${newDrawerRemoval.User.lastName}`,
                                change: newDrawerRemoval.removedAmount * -1,
                                cash: this.drawer.currentBalance,
                                newDrawerRemoval
                            });

                            this.history.sort( ( a, b ) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf() );

                        });

                    }
                    this.managerPinEntryResultSubscription && this.managerPinEntryResultSubscription.unsubscribe();
                    this.afterClosedCashRemovalDialogSubscription && this.afterClosedCashRemovalDialogSubscription.unsubscribe();

                    this.drawerService.getCurrent(true, localStorage.getItem('deviceId')).subscribe(drawer => {
                        console.log("Current: " + drawer);
                        console.log("Limit: " + this.store.settings.drawerAmountForAlert);
                        if (drawer.currentBalance <= this.store.settings.drawerAmountForAlert){
                            console.log("Drawer Limit Alert Should Now Be Removed");
                            this.drawerService.settingDrawerLimitCheck(false);
                        }
                    });
                });
            }
        });
    }

    switchUsers() {
        this.userService.doLogout()
    }

    toggleDrawer() {
        if( this.drawer.startingAmount == null ) {
            this.drawerService.showDrawerStartModal(this.drawer)
        } else if(!this.drawer.endingAmount){
            if( environment.drawerCloseMode === 'report' ) {
                this.drawer.endingAmount = this.drawer.startingAmount + (this.drawer.Receipts || []).reduce((total, receipt) => total + receipt.total, 0);
                this.drawer.closedAt = new Date();
                this.drawer.closedByUserId = this.user.id;
                this.drawer.closedByUser = this.user;
                this.drawerService.update(this.drawer)
                    .then(() => {
                        this.printerService.printDrawerClosingReport(this.user.id, undefined, moment().tz(this.store.timeZone).startOf('day').format("YYYY-MM-DD"));

                        const drawerLog = this.drawerLogService.newInstance();
                        drawerLog.drawerId = this.drawer.id;
                        drawerLog.event = `Drawer ended by ${this.user.firstName} ${this.user.lastName}`;
                        return this.drawerLogService.insert(drawerLog)
                            .then( () => {
                                if( !this.drawer.Log ) this.drawer.Log = [ ];
                                this.drawer.Log.push(drawerLog);
                                this.drawerService.afterClose();
                                this.drawerService.showClosingReport();
                            })
                    })
            } else {
                this.drawerService.showDrawerEndModal(this.drawer)
            }
        }
    }

    viewReceipt(receipt: IReceipt) {
        if(receipt) this.receiptService.view(receipt)
    }


}
