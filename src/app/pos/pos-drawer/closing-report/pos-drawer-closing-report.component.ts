import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import * as moment from 'moment-timezone';
import {DrawerService} from "../../../services/drawer.service";
import {IDrawer} from "../../../models/interfaces/drawer.interface";
import {IReceipt} from "../../../models/interfaces/receipt.interface";
import {IStore} from "../../../models/interfaces/store.interface";
import {ITax} from "../../../models/interfaces/tax.interface";
import {ReceiptService} from "../../../services/receipt.service";
import {DeviceProxyService} from "../../../services/device-proxy.service";
import {StoreService} from "../../../services/store.service";
import {TaxService} from "../../../services/tax.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {UserService} from "../../../services/user.service";
import {User} from "../../../models/user.model";
import {IUser} from "../../../models/interfaces/user.interface";
import {didSet} from "app/lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DateRange} from "../../../lib/date-range";
import {PrinterService} from "../../../services/printer.service";
import {DeviceService} from "../../../services/device.service";
import {IDevice} from "../../../models/interfaces/device.interface";
import {environment} from "../../../../environments/environment";

export function didSetOption(newValue: 'user'|'device'|'store') {

    if(this.mode && this.user && this.selectedDate) {
        this.drawerService.getDrawerClosingReport(
            this.mode == 'user' ? this.user.id : undefined,
            this.mode == 'device' && this.device ? this.device.id : undefined,
            moment(this.selectedDate).format('YYYY-MM-DD')
        )
            .then(report => {
                console.log(report);

                if (this.mode == 'user' || this.mode == 'device') {
                    this.reportDataArray = report.drawerAggregates;
                    //Note: This check makes no sense. allDrawers is an object
                    if(report.allDrawers.length > 1) {
                        this.reportDataArray.push(report.allDrawers);
                    }
                }
                else if(this.mode == 'store') {
                    this.reportDataArray = [report.allDrawers]
                }
            })
    }



}

@Component({
    selector: 'app-pos-drawer-closing-report',
    templateUrl: './pos-drawer-closing-report.component.html',
    styleUrls: [ './pos-drawer-closing-report.component.css' ]
})
export class PosDrawerClosingReportComponent implements OnInit, OnDestroy {

    public drawers: IDrawer[];

    public taxes: Object;
    public productTypes: Object;

    objectKeys = Object.keys;

    drawerEmittedSubscription: Subscription;
    productTypeAllEmittedSubscription: Subscription;
    storeEmittedSubscription: Subscription;
    taxAllEmittedSubscription: Subscription;
    userEmittedSubscription: Subscription;
    selectedProductTypeId: string;
    lastDrawerId: string;
    store: IStore;
    daySalesTaxIncluded: number;
    daySalesTaxExcluded: number;
    now = moment();
    taxTotals: Object;
    device: IDevice;

    modeOptions = [];

    @didSet(didSetOption) selectedDate: Date = new Date();
    @didSet(didSetOption) mode: 'user'|'device'|'store' = 'user';


    reportDataArray: any;

    @didSet(didSetOption) user: IUser;

    constructor(
        injector: Injector,
        private drawerService: DrawerService,
        private taxService: TaxService,
        private receiptService: ReceiptService,
        private deviceProxyService: DeviceProxyService,
        private productTypeService: ProductTypeService,
        private storeService: StoreService,
        private userService: UserService,
        private printerService: PrinterService,
        private deviceService: DeviceService
    ) {
        this.modeOptions = [
            {
                value: 'user',
                label: 'User'
            },
            {
                value: 'store',
                label: 'Store'
            }
        ];

        if (environment['deviceDrawerClosingReport']) {
            this.modeOptions.unshift({
                value: 'device',
                label: 'Device'
            });
        }
    }

    ngOnDestroy(){
        this.storeEmittedSubscription && this.storeEmittedSubscription.unsubscribe();
        this.drawerEmittedSubscription && this.drawerEmittedSubscription.unsubscribe();
        this.taxAllEmittedSubscription && this.taxAllEmittedSubscription.unsubscribe();
        this.productTypeAllEmittedSubscription && this.productTypeAllEmittedSubscription.unsubscribe();
        this.userEmittedSubscription && this.userEmittedSubscription.unsubscribe();
    }

    ngOnInit() {

        this.userEmittedSubscription = this.userService.userEmitted.subscribe(user => {
            this.user = user;
            this.store = user.Store;

            const deviceId = localStorage.getItem('deviceId');
            if (deviceId) {
                this.deviceService.get(deviceId).subscribe(device => {
                    this.device = device;
                });
            }
        });

        // this.storeEmittedSubscription = this.storeService.currentStoreEmitted.subscribe( store => this.store = store )
        //
        // this.drawerEmittedSubscription = this.drawerService.getUserDrawersForDay().subscribe( drawers => {
        //     this.lastDrawerId = drawers[ drawers.length - 1 ].id
        //     this.drawers = drawers
        //
        //     this.daySalesTaxIncluded =
        //         this.drawers.reduce( ( total, drawer ) => total + ( drawer.Receipts ? drawer.Receipts.reduce( ( total, receipt ) => total + receipt.total, 0 ) : 0 ), 0 )
        //
        //     this.daySalesTaxExcluded =
        //         this.drawers.reduce( ( total, drawer ) => total + ( drawer.Receipts ? drawer.Receipts.reduce( ( total, receipt ) => total + receipt.total - receipt.tax, 0 ) : 0 ), 0 )
        //
        //     this.taxTotals = this.drawers.reduce( ( totals, drawer ) => {
        //         if( !drawer.Receipts ) return totals
        //         drawer.Receipts.forEach( receipt => {
        //             const taxByType = receipt.taxByType;
        //             Object.keys(taxByType).forEach(taxId => {
        //                 if(!totals[taxId]) totals[taxId] = 0
        //                 totals[taxId] += taxByType[taxId]
        //             } )
        //         } )
        //         return totals
        //     }, { } )
        //
        //     if( this.drawers[ this.drawers.length - 1 ].Receipts.length ) {
        //         this.selectedProductTypeId = this.drawers[ this.drawers.length - 1 ].Receipts[0].LineItems[0].Product.productTypeId
        //     }
        // } )
        //
        // this.taxAllEmittedSubscription = this.taxService.all().subscribe( taxes => {
        //     this.taxes = taxes.reduce( ( hash, tax ) => Object.assign( hash, { [tax.id]: tax } ), { } )
        // } )
        //
        // this.productTypeAllEmittedSubscription = this.productTypeService.all().subscribe( productTypes => {
        //     Observable.combineLatest(productTypes).subscribe( instances => {
        //         this.productTypes = instances.reduce( ( hash, productType ) => Object.assign( hash, { [productType.id]: productType } ), { } )
        //     } )
        // } )
    }

    viewReceipt(receipt: IReceipt) {
        if(receipt) this.receiptService.view(receipt)
    }

    onClickExport(){

        let userId = this.mode == 'user' ? this.user.id : undefined;
        let deviceId = this.mode == 'device' && this.device ? this.device.id : undefined;
        let selectedDate = moment(this.selectedDate).format('YYYY-MM-DD');

        this.printerService.printDrawerClosingReport(userId, deviceId, selectedDate);

    }
}
