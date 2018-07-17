import {Component, OnInit} from "@angular/core";
import {ReceiptService} from "../../../services/receipt.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {SalesReportService} from "../../../services/report-services/sales-report.service";
import {UserService} from "../../../services/user.service";
import {TransactionService} from "../../../services/transaction.service";
import {DrawerService} from "../../../services/drawer.service";
import {IUser} from "../../../models/interfaces/user.interface";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {didSet} from "../../../lib/decorators/property/didSet";

import * as moment from 'moment';

export function didSetDate(newValue){
    let date = moment(newValue).format("MM/DD/YYYY");
    this.dateSource.next(date);
}

export function didSetOption(newValue: 'breakdown'|'closing') {

    if (this.mode && this.date) {

        if (this.mode == 'breakdown') {
            this.salesReportService.drawerBreakdownReport(moment(this.date, "MM/DD/YYY").format("MM/DD/YYYY")).subscribe(drawerInfo => {
                this.drawerInfo = drawerInfo;
            });
        } else if (this.mode == 'closing') {
            this.drawerService.getDrawerClosingReport(undefined, undefined, moment(this.date, "MM/DD/YYY").format('YYYY-MM-DD')).then(report => {
                this.drawerClosingReport = [report.allDrawers];
            });
        }
    }
}

@Component({
    selector: 'app-drawer-breakdown',
    templateUrl: './drawer-breakdown.component.html',
    styleUrls: ['./drawer-breakdown.component.css']
})
export class DrawerBreakdownComponent implements OnInit{

    user: IUser;
    drawerInfo: any = [];
    drawerClosingReport: any = [];

    dateSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    modeOptions = [{
        value: 'breakdown',
        label: 'Breakdown'
    }, {
        value: 'closing',
        label: 'Closing Report'
    }];

    @didSet(didSetDate) date;
    @didSet(didSetOption) mode: 'breakdown'|'closing' = 'breakdown';

    constructor(
        private receiptService: ReceiptService,
        private loadingBarService: SlimLoadingBarService,
        private salesReportService: SalesReportService,
        private userService: UserService,
        private transactionService: TransactionService,
        private drawerService: DrawerService
    ){

    }

    ngOnInit(){
        this.userService.userEmitted
            .subscribe(
                user => {
                    this.user = user;
                }
            );

        // By default load today breakdown
        this.dateSource.asObservable()
            .subscribe(date => {

                if (this.mode == 'breakdown') {
                    this.salesReportService.drawerBreakdownReport(date).subscribe(drawerInfo => {
                        this.drawerInfo = drawerInfo;
                    });
                } else if (this.mode == 'closing') {
                    this.drawerService.getDrawerClosingReport(undefined, undefined, moment(date).format('YYYY-MM-DD')).then(report => {
                        this.drawerClosingReport = [report.allDrawers];
                    });
                }
            });

        this.date = new Date();
    }

    onClickExport(){
        this.salesReportService.downloadDrawerReport(this.date).then( url => {
            $("<iframe/>").attr({
                src: url,
                style: "visibility:hidden;display:none"
            }).appendTo(".content")
        } )

    }

}
