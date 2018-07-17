import {Component, OnInit, Output} from "@angular/core";
import {Observable} from "rxjs";

import {TransactionService} from "../../../services/transaction.service";
import {ITransaction} from "../../../models/interfaces/transaction.interface";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";

@Component({
    selector: 'app-sales-index',
    templateUrl: './sales-index.component.html',
    styleUrls: ['./sales-index.component.css']
})
export class SalesIndexComponent implements OnInit {

    salesData: Observable<ITransaction>[];
    @Output() isSalesIndexExportModalShowing: boolean = false;
    @Output() isSalesIndexExportModalAboutToClose: boolean = false;

    constructor(private transactionService: TransactionService, private loadingBarService: SlimLoadingBarService) {
    }

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    ngOnInit() {
        this.loadingBarService.interval = 10;

        this.transactionService.getReportData(this.dateRangeSource, this.loadingBarService).subscribe((salesData) => {
            this.salesData = salesData;

            this.loadingBarService.complete();
        });
    }

    onClickShowExportModal() {
        this.isSalesIndexExportModalShowing = true;
    }

    onSalesIndexExportModalClosed() {
        window.setTimeout(() => {
            this.isSalesIndexExportModalShowing = false;
            this.isSalesIndexExportModalAboutToClose = false;
        }, 100)
    }

    onSalesIndexExportModalExport(type: string) {
        this.export(type, "sales");
    }

    export(type: string, report: string = "sales"){
        this.dateRangeSource.take(1).subscribe(dateRange => {
            this.transactionService.downloadReport({ report, dateRange, type }).then((url) => {
                $("<iframe/>").attr({
                    src: url,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");

                // Can't immediately remove component because it has external modal dialog dom changes
                // Therefore additional property is triggered to close modal dialog first
                this.isSalesIndexExportModalAboutToClose = true;
            });
        })
    }
}
