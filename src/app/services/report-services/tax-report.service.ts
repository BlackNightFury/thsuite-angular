import {Injectable} from "@angular/core";
import {Socket, SocketService} from "../../lib/socket";
import {IReceiptFilters} from "../receipt.service";
import {DateRange} from "../../lib/date-range";


@Injectable()
export class TaxReportService {

    private socket: Socket;

    constructor(private socketService: SocketService) {
        this.socket = this.socketService.getSocket('tax-reports');
    }

    overallTaxReport(args) {
        return this.socket.emitPromise('overall-tax-report', args)
    }
}
