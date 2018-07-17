import {Injectable} from "@angular/core";
import {Socket, SocketService} from "../../lib/socket";
import {DateRange} from "../../lib/date-range";
import {IReceiptFilters} from "../receipt.service";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IReceipt} from "app/models/interfaces/receipt.interface";
import {Receipt} from "../../models/receipt.model";


@Injectable()
export class SalesReportService {

    private socket: Socket;

    constructor(private socketService: SocketService) {
        this.socket = this.socketService.getSocket('sales-reports');
    }

    salesByTransactionTimeReport(dateRange: DateRange, filters: IReceiptFilters){

        let subject = new Subject<any>();

        this.socket.emitPromise('sales-by-transaction-time-report', {dateRange, filters})
            .then(data => {
                data['desiredReceipts'] = data['desiredReceipts'].map(receipt => new Receipt(receipt));
                subject.next(data);
            });

        return subject.asObservable();
    }

    downloadTransactionTimeReport(args){
        return this.socket.emitPromise('download-transaction-time-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }

    salesBreakdownReport(dateRange: DateRange, filters: IReceiptFilters): Observable<IReceipt[]> {

        let subject = new Subject<IReceipt[]>();

        this.socket.emitPromise('sales-breakdown-report', {dateRange, filters})
            .then(receipts => {
                subject.next(receipts.map(receipt => new Receipt(receipt)));
            });

        return subject.asObservable()
    }

    salesBreakdownReportByPackageId(packageId: string): Observable<IReceipt[]> {
        let subject = new Subject<IReceipt[]>();

        this.socket.emitPromise('sales-breakdown-report-by-package', {packageId})
            .then(receipts => {
                subject.next(receipts.map(receipt => new Receipt(receipt)));
            });

        return subject.asObservable()
    }

    downloadBreakdownReport(args){
        return this.socket.emitPromise('download-breakdown-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
            console.log('err: ');
            console.log(err);
        });
    }

    drawerBreakdownReport(date: string){
        let subject = new Subject<any>();

        this.socket.emitPromise('drawer-report', {date})
            .then(drawerInfo => {
                subject.next(drawerInfo);
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });

        return subject.asObservable();

    }

    downloadDrawerReport(date: string){
        return this.socket.emitPromise('download-drawer-report', {date})
            .then(response => {
                return response;
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            })
    }
}
