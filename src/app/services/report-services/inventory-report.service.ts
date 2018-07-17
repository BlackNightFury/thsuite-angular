import {Injectable} from "@angular/core";
import {Socket, SocketService} from "../../lib/socket";


@Injectable()
export class InventoryReportService {

    private socket: Socket;

    constructor(private socketService: SocketService) {
        this.socket = this.socketService.getSocket('inventory-reports');
    }

    inventoryBreakdownReport(options: any) {
        return this.socket.emitPromise('inventory-breakdown-report', options);
    }

    inventoryBreakdownReportExport(options: any) {
        return this.inventoryBreakdownReport( Object.assign( { export: true }, options ) )
    }

    inventoryDailyReport(options: any) {
        return this.socket.emitPromise('inventory-daily-report', options);
    }

    inventoryDailyReportExport(options: any) {
        return this.inventoryDailyReport( Object.assign( { export: true }, options ) )
    }
}
