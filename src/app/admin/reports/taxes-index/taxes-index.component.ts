import {Component, OnInit, OnDestroy} from "@angular/core";
import {IReceipt} from "../../../models/interfaces/receipt.interface";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscription} from "rxjs/Subscription";
import {ObjectWithToggle} from "../../../lib/object-with-toggle";
import {DateRange} from "../../../lib/date-range";
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReceiptService} from "../../../services/receipt.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {TaxService} from "../../../services/tax.service";
import {ITax} from "../../../models/interfaces/tax.interface";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {TaxReportService} from "../../../services/report-services/tax-report.service";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetPaymentMethod(newValue){
    this.togglePaymentMethodSource.next(newValue);
}

export function didSetPage(newValue) {

    if(this.receipts) {
        this.receiptsPage = this.receipts
            .slice(newValue * 10, newValue * 10 + 10)
            .map(receipt => {
                receipt.isToggled = false;
                return receipt;
            });
        document.body.scrollTop = 0;
    }

}

@Component({
    selector: 'app-taxes-index',
    templateUrl: './taxes-index.component.html',
    styleUrls: ['../sales-breakdown/sales-breakdown.component.css']
})
export class TaxesIndexComponent implements OnInit, OnDestroy{

    public receipts: any[];
    public receiptsPage: any[];

    public taxes: ITax[];

    public store: IStore;
    storeSubscription: Subscription;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    @didSet(didSetPaymentMethod) paymentMethod: 'all'| 'cash' | 'gift-card';

    togglePaymentMethodOptions: Array<Object> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'Cash',
            value: 'cash'
        },
        {
            label: 'Gift Card',
            value: 'gift-card'
        }
    ];

    togglePaymentMethodSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    lineItemColspan: number;

    @didSet(didSetPage) page : number = 0;

    get numPages() {

        return this.receipts ? Math.ceil(this.receipts.length / 10) : 0
    }

    private _paymentMethodOptions: 'all'|'in'|'out' = 'all';

    constructor(
        private taxService: TaxService,
        private receiptService: ReceiptService,
        private loadingBarService: SlimLoadingBarService,
        private taxReportService: TaxReportService,
        private storeService: StoreService,
        private previousRouteService: PreviousRouteService
    ) {
    }

    ngOnDestroy() {
        this.storeSubscription && this.storeSubscription.unsubscribe()
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("/admin/reports/taxes-index");

        this.taxService.allWithDeleted().subscribe(taxes => {
            this.taxes = taxes;
            //4 here because hard coded columns are: Receipt ID, Date/Time, Payment Method and Total Tax
            this.lineItemColspan = 4 + this.taxes.length;
            console.log(this.lineItemColspan);
        });

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
            Observable.combineLatest(
                this.dateRangeSource,
                this.togglePaymentMethodSource,
                (dateRange, paymentMethod) => {
                    return {
                        dateRange: dateRange,
                        filters:{
                            paymentMethod: paymentMethod
                        }
                    }
                }
            ).do(() => {
                this.loadingBarService.interval = 100;
                this.loadingBarService.start()
            })
                .subscribe(searchTerms => {
                    this.taxReportService.overallTaxReport(searchTerms)
                        .then(report => {
                            this.receipts = report;
                            this.receiptsPage = this.receipts
                                .slice(this.page * 10, this.page * 10 + 10)
                                .map(receipt => {
                                    receipt.isToggled = false;
                                    return receipt;
                                });

                            this.loadingBarService.complete();
                        })
                })
        })
        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.paymentMethod = 'all';
        }
        this.togglePaymentMethodSource.next(this.paymentMethod);
    }


    export() {
        Observable.combineLatest(
            this.dateRangeSource.take(1),
            this.togglePaymentMethodSource.take(1),
            (dateRange, paymentMethod) => {
                return {
                    dateRange: dateRange,
                    filters:{
                        paymentMethod: paymentMethod
                    }
                }
            }
        ).do(() => {
                this.loadingBarService.interval = 100;
                this.loadingBarService.start()
            })
        .subscribe( searchTerms => {
            this.taxReportService.overallTaxReport( Object.assign( { timeZone: this.store.timeZone, export: true }, searchTerms ) )
            .then((url) => {
                this.loadingBarService.complete();
                var iframe = $("<iframe/>").attr({
                     src: url.Location,
                     style: "visibility:hidden;display:none"
                }).appendTo(".content");
            });
        } )
    }

    toggleReceipt(receipt){

        var previousToggled = receipt.isToggled;

        this.receiptsPage.forEach((r) => {
            r.isToggled = false;
        });

        receipt.isToggled = !previousToggled;
    }
}
