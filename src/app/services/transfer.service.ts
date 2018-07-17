import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import * as moment from "moment-timezone";
import {SocketService} from "../lib/socket";
import {ITransfer} from "../models/interfaces/transfer.interface";
import {SearchResult} from "../lib/search-result";
import {Transfer} from "../models/transfer.model";
import {SearchableService} from "./searchable.service";
import {Router} from "@angular/router";
import {Mixin} from "../lib/decorators/class/mixin";
import {ObjectObservable} from "../lib/object-observable";
import {SupplierService} from "./supplier.service";


@Injectable()
@Mixin([SearchableService])
export class TransferService extends CommonService<ITransfer> implements SearchableService<ITransfer> {

    constructor(
        injector: Injector,
        private supplierService: SupplierService
    ) {
        super(injector, 'transfers');
    }

    search: (query: string, page: number) => Observable<SearchResult<ITransfer>>;

    newInstance() {
        return new Transfer({
            id: uuid.v4(),
            version: 0,

            type: '',
            ManifestNumber: 0,
            supplierId: '',

            EstimatedArrivalDateTime: null,

            DeliveryPackageCount: 0,
            DeliveryReceivedPackageCount: 0,

            CreatedByUserName: '',

            ReceivedDateTime: null

        });
    }

    dbInstance(fromDb: ITransfer) {
        return new Transfer(fromDb);
    }

    instanceForSocket(object: ITransfer): ITransfer{
        return {
            id: object.id,
            version: object.version,

            type: object.type,
            ManifestNumber: object.ManifestNumber,
            supplierId: object.supplierId,

            EstimatedArrivalDateTime: object.EstimatedArrivalDateTime,

            DeliveryPackageCount: object.DeliveryPackageCount,
            DeliveryReceivedPackageCount: object.DeliveryReceivedPackageCount,

            CreatedByUserName: object.CreatedByUserName,
            ReceivedDateTime: object.ReceivedDateTime
        }
    }

    resolveAssociations(transfer: ITransfer): ObjectObservable<ITransfer>{
        let obs = Observable.combineLatest(
            this.supplierService.get(transfer.supplierId),
            (supplier) => {
                transfer.Supplier = supplier;
                return transfer;
            }
        );

        return new ObjectObservable(obs, transfer.id);
    }

    inboundReportData(args: any): Promise<any>{
        return this.socket.emitPromise('inbound-report', args);
    }

    packagesForTransfer(transfer: ITransfer, type: string): Promise<any> {
        return this.socket.emitPromise('packages', {id: transfer.id, type: type});
    }

    list(type: string) {
        this.router.navigate(['admin', 'inventory', type]);
    }

    export(args: any) {
        return this.socket.emitPromise('export', args);
    }

    view(transfer: ITransfer, type: string) {
        this.router.navigate(['admin', 'inventory', type, 'view', transfer.id]);
    }

    cancelEdit(type: string) {
        this.router.navigate(['admin', 'inventory', type]);
    }

}
