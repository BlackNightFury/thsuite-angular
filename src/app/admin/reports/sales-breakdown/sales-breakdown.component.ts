import {Component, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {PackageService} from "../../../services/package.service";
import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {SupplierService} from "../../../services/supplier.service";
import {TransactionService} from "../../../services/transaction.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {DateRange} from "../../../lib/date-range";
import {Subject} from "rxjs/Subject";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscription} from "rxjs/Subscription";
import {ReceiptService} from "../../../services/receipt.service";
import {IReceipt} from "../../../models/interfaces/receipt.interface";
import {ObjectWithToggle} from "../../../lib/object-with-toggle";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {SalesReportService} from "../../../services/report-services/sales-report.service";
import {UserService} from "../../../services/user.service";
import {IUser} from "../../../models/interfaces/user.interface";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";
import {PreviousRouteService} from "../../../services/previous-route.service";

export function didSetPaymentMethod(newValue){
    this.togglePaymentMethodSource.next(newValue);
}

export function didSetEmployeeId(newValue){
    this.employeeUserIdSource.next(newValue);
}

export function didSetPage(newValue) {
    if(this.receipts) {
        this.receiptsPage = this.receipts
            .slice(newValue * 10, newValue * 10 + 10)
            .map(receipt => {
                return {
                    object: receipt,
                    isToggled: false
                }
            });
        document.body.scrollTop = 0;
    }
}

@Component({
    selector: 'app-sales-breakdown',
    templateUrl: './sales-breakdown.component.html',
    styleUrls: ['./sales-breakdown.component.css']
})
export class SalesBreakdownComponent implements OnInit, OnDestroy {

    public receipts: IReceipt[];
    public receiptsPage: ObjectWithToggle<IReceipt>[];

    public store: IStore;
    storeSubscription: Subscription;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    @didSet(didSetPaymentMethod) paymentMethod: 'all'| 'cash' | 'gift-card';
    @didSet(didSetEmployeeId) selectedEmployeeId: string;

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
    employeeUserIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    searchTermSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    employeeSelect2Options: Select2Options;

    @didSet(didSetPage) page : number = 0;

    get numPages() {
        return this.receipts ? Math.ceil(this.receipts.length / 10) : 0
    }

    combineLatest() {
        return Observable.combineLatest(
            this.dateRangeSource,
            this.togglePaymentMethodSource,
            this.employeeUserIdSource,
            this.searchTermSource,
            (dateRange, paymentMethod, userId, searchTerm) => {
                return {
                    dateRange: dateRange,
                    filters:{
                        paymentMethod: paymentMethod,
                        userId: userId,
                        searchTerm: searchTerm
                    }
                }
            }
        )
    }

    user: IUser;

    constructor(
        private receiptService: ReceiptService,
        private loadingBarService: SlimLoadingBarService,
        private salesReportService: SalesReportService,
        private userService: UserService,
        private transactionService: TransactionService,
        private storeService: StoreService,
        private previousRouteService: PreviousRouteService
    ) {
    }

    ngOnDestroy() {
        this.storeSubscription && this.storeSubscription.unsubscribe()
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/reports/sales-breakdown");

        this.userService.userEmitted
            .subscribe(
                user => {
                    this.user = user;
                }
            );

        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store
            this.combineLatest()
            .do(() => {
                    this.loadingBarService.interval = 100;
                    this.loadingBarService.start()
                })
                .switchMap(searchTerms => this.salesReportService.salesBreakdownReport(searchTerms.dateRange, searchTerms.filters))
                .subscribe(data => {
                    this.receipts = data;
                    this.receiptsPage = this.receipts
                        .slice(this.page * 10, this.page * 10 + 10)
                        .map(receipt => {
                            return {
                                object: receipt,
                                isToggled: false
                            }
                        });

                    this.loadingBarService.complete();
                });
        });

        CommonAdapter(this.userService, 'id', user => `${user.firstName} ${user.lastName}`, {})
            .then(UserAdapter => {
                let employeeSelect2Options = {
                    placeholder: "Employee",
                    allowClear: true,
                    ajax: { },
                    dropdownCssClass: 'compact'
                };

                employeeSelect2Options['dataAdapter'] = UserAdapter;
                this.employeeSelect2Options = employeeSelect2Options;
            })
            .catch(e => console.log(e.stack || e ))

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.paymentMethod = 'all';
            this.selectedEmployeeId = '';
        }
        this.togglePaymentMethodSource.next(this.paymentMethod);
        this.employeeUserIdSource.next(this.selectedEmployeeId);
    }

    search(value: string){
        this.searchTermSource.next(value);
    }

    onClickExport(report){
        this.loadingBarService.interval = 100;
        this.loadingBarService.start();
        this.combineLatest().take(1).subscribe(args => {
            this.salesReportService.downloadBreakdownReport( Object.assign({report,timeZone: this.store.timeZone}, args) )
                .then( url => {
                this.loadingBarService.complete();
                $("<iframe/>").attr({
                   src: url,
                   style: "visibility:hidden;display:none"
               }).appendTo(".content")
            } )
        })
    }

    calculateReceiptProfitPercent(receipt) {
        const totalCost = receipt.LineItems.reduce((acc, lineItem) => {
            return acc + (lineItem.subtotal - lineItem.discount - lineItem.wholesalePrice);
        }, 0);

        const totalProfit = receipt.LineItems.reduce((acc, lineItem) => {
            return acc + (lineItem.subtotal-lineItem.discount);
        }, 0);

        return isNaN(totalCost) || totalCost <= 0 || !totalProfit ? 'N/A' : Math.round((totalCost/totalProfit) * 100) + '%';
    }


    calculateLineItemProfitPercent(lineItem) {
        const totalCost = (lineItem.subtotal - lineItem.discount - lineItem.wholesalePrice);
        const totalProfit = (lineItem.subtotal-lineItem.discount);

        return isNaN(totalCost) || totalCost <= 0 || !totalProfit ? 'N/A' : Math.round((totalCost/totalProfit) * 100) + '%';
    }

    toggleReceipt(receipt){

        var previousToggled = receipt.isToggled;

        this.receiptsPage.forEach((r) => {
            r.isToggled = false;
        });

        receipt.isToggled = !previousToggled;
    }
}
