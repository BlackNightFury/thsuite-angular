import {CommonService} from "./common.service";
import {SearchableService} from "./searchable.service";
import {Socket, SocketService} from "../lib/socket";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Router} from "@angular/router";
import {Mixin} from "../lib/decorators/class/mixin";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {DeviceProxyService} from "app/services/device-proxy.service";
import {IPrinter} from "../models/interfaces/printer.interface";
import {Printer} from "../models/printer.model";
import {IUser} from "../models/interfaces/user.interface";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {IStore} from "../models/interfaces/store.interface";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {IBarcode} from "../models/interfaces/barcode.interface";
import {ITimeClock} from "../models/interfaces/time-clock.interface";

@Injectable()
export class LoggingService {

    socket: Socket;

    constructor(private socketService: SocketService){
        this.socket = this.socketService.getSocket('logs');
    }


    logError(error: any) {
        this.socket.emitPromise('log-error', error);
    }

}

