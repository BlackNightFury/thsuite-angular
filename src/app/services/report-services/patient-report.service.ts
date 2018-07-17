import {Injectable} from "@angular/core";
import {Socket, SocketService} from "../../lib/socket";
import {DateRange} from "../../lib/date-range";
import {IReceiptFilters} from "../receipt.service";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IReceipt} from "app/models/interfaces/receipt.interface";
import {Receipt} from "../../models/receipt.model";

import {ProductType} from "../../models/product-type.model";
import {IProductType} from "../../models/interfaces/product-type.interface";

@Injectable()
export class PatientReportService {

    private socket: Socket;

    constructor(private socketService: SocketService) {
        this.socket = this.socketService.getSocket('patient-reports');
    }

    getSellingData(dateRangeObservable: Observable<DateRange>, mode: string = 'best-seller'): Observable<any[]> {

        return dateRangeObservable
            .switchMap(dateRange => {
                if (dateRange && dateRange.startDate) {
                    return this.socket.emitPromise('sales-data', {
                        mode: mode,
                        startDate: dateRange.startDate,
                        endDate: dateRange.endDate
                    })
                        .catch(err => {
                            console.log('err: ');
                            console.log(err);
                        });
                } else {
                    return new Promise(resolve => resolve(true));
                }
            });
    }

    downloadReport(args) {
        return this.socket.emitPromise('download-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }
}
