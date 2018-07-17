import {ObjectsIndexComponent} from "../../util/objects-index.component";

import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";

import * as moment from 'moment-timezone';
import {PosCartService} from "../../services/pos-cart.service";
import {PrinterService} from "../../services/printer.service";
import {ReceiptService} from "../../services/receipt.service";
import {StoreService} from "../../services/store.service";
import {TransactionService} from "../../services/transaction.service";
import {IReceipt} from "../../models/interfaces/receipt.interface";
import {IStore} from "../../models/interfaces/store.interface";
import {SortBy} from "../../util/directives/sort-table-header.directive";
import {DateRange} from "../../lib/date-range";
import {Receipt} from "../../models/receipt.model";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-pos-receipt',
    templateUrl: './pos-receipt.component.html',
    styleUrls: ['./pos-receipt.component.css']
})

export class PosReceiptComponent extends ObjectsIndexComponent<IReceipt> implements OnInit {

    exportDay: Date;

    store: IStore;

    public environment;

    constructor(
        injector: Injector,
        private receiptService: ReceiptService,
        private posCartService: PosCartService,
        private printerService: PrinterService,
        private storeService: StoreService,
        private transactionService: TransactionService
    ) {
        super(injector, receiptService);
    }

    listReceipts() {
        this.receiptService.list();
    }

    ngOnInit() {
        super.ngOnInit();

        this.environment = environment;

        this.extraFilters.next({ includeDeleted: true });
        this.sortBy.next( new SortBy( 'createdAt', 'desc' ) );

        /*
        this.searchTerms.take(1).subscribe( term => {
            this.setDateRange(term)
        } )
        */

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.exportDay = moment().tz(store.timeZone).toDate();
            this.store = store;
        } );
    }

    onActionClick( event ) {
        event.stopPropagation();
    }

    onReceiptAction( event, receipt ) {

        const receiptToSend = new Receipt(receipt);
        const lineItemsToSend = [];

        if (event.value === 'print' || event.value === 'print-label') {
            for (let lineItem of receiptToSend.LineItems){
                lineItem.Product = undefined;
                lineItem.ProductVariation = undefined;
                const transactionsToSend = [];
                for (let transaction of lineItem.Transactions){
                    transaction.Package = undefined;
                    transaction.Item = undefined;
                    transaction.Product = undefined;
                    transaction.ProductVariation = undefined;
                    transactionsToSend.push(transaction);
                }
                lineItem.Transactions = transactionsToSend;
                lineItemsToSend.push(lineItem);
            }

            receiptToSend.LineItems = lineItemsToSend;
        }

        if (event.value === 'return') {
            this.posCartService.refundDetailModal(receipt.barcode);
        } else if (event.value === 'print') {
            this.printerService.printReceipt(receiptToSend, this.store);
        } else if (event.value === 'print-label') {
            if (!this.environment.printPatientLabels) {
                this.printerService.printTransactionLabels(receiptToSend, this.store);
            } else {
                this.printerService.printPatientLabels(receiptToSend, this.store);
            }

            this.printerService.printBulkFlowerLabels(receiptToSend, this.store);
        } else if (event.value === 'void-confirmation') {
            console.log("Void confirmation selected");
            this.posCartService.showReceiptVoidModal(receipt);

        } else if (event.value === 'void') {

            const confirmed = confirm("Are you sure you want to void receipt?");

            if (!confirmed) {
                return;
            }

            this.receiptService.void(receipt)
                .catch( e => {
                    console.log(`Error voiding receipt: ${e.stack || e}`);
                    alert("There was an error voiding the receipt");
                } );
        }

        event.source.value = '';
    }

    onRowClick( event, receipt ) {
        if ($(event.target).is('md-select') || receipt.deletedAt) {
            return;
        }

        this.viewReceipt(receipt);
    }

    search(term: string) {
        // this.setDateRange(term)
        this.searchTerms.next(term);
    }

    setDateRange(term) {
        this.extraFilters.next( term.trim().length === 0 ? { startDate: moment().startOf('day'), endDate: moment().endOf('day') } : { } );
    }

    viewReceipt(receipt: IReceipt) {
        this.receiptService.view(receipt);
    }

    exportDayTransactions() {

        const args = {
            startDate: moment.tz(moment(this.exportDay).format('MM/DD/YYYY'), 'MM/DD/YYYY', this.store.timeZone).utc().format(),
            endDate: moment.tz(moment(this.exportDay).format('MM/DD/YYYY'), 'MM/DD/YYYY', this.store.timeZone).endOf('day').utc().format(),
            timeZone: this.store.timeZone
        };

        this.transactionService.exportDayTransactions(args)
        .then((url) => {
            const iframe = $("<iframe/>").attr({
                src: url,
                style: "visibility:hidden;display:none"
            }).appendTo(".receipts-table");
        });
    }

    async submitToMetrc() {
        const confirmed = confirm("Are you sure you want to transmit to Metrc?");

        if (!confirmed) {
            return;
        }

        try {
            const message = await this.transactionService.submitToMetrc();
            alert(message);
        } catch (err) {
            return alert("There was an error submitting the transactions");
        }
    }
}
