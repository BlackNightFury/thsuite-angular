import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import {IProduct} from "../models/interfaces/product.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ISupplier} from "../models/interfaces/supplier.interface";
import {Supplier} from "../models/supplier.model";
import {Router} from "@angular/router";
import {SearchableService} from "./searchable.service";
import {DateRange} from "../lib/date-range";
import {SearchResult} from "../lib/search-result";
import {Mixin} from "../lib/decorators/class/mixin";


@Injectable()
@Mixin([SearchableService])
export class SupplierService extends CommonService<ISupplier> implements SearchableService<ISupplier> {

    constructor(injector: Injector) {
        super(injector, 'suppliers');
    }

    private suppliers = new Subject<Observable<ISupplier>[]>();

    all(): Observable<Observable<ISupplier>[]> {

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                this.suppliers.next(objects);
            });

        return this.suppliers.asObservable()
    }

    search(query: string, page: number): Observable<SearchResult<ISupplier>> {

        let results = new Subject<SearchResult<ISupplier>>();

        this.socket.emitPromise('search', {query, page})
            .then(response => {

                let objects = response.objects.map(this.getAssociated.bind(this));

                results.next(new SearchResult(objects, response.numPages));
            });

        return results.asObservable();
    }

    newInstance() {
        return new Supplier({
            id: uuid.v4(),
            version: 0,
            name: '',
            streetAddress: '',
            city: '',
            state: '',
            zip: '',
            phone: '',
            contactName: ''
        });
    }
    dbInstance(fromDb: ISupplier) {
        return new Supplier(fromDb);
    }

    instanceForSocket(object: ISupplier): ISupplier{
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            streetAddress: object.streetAddress,
            city: object.city,
            state: object.state,
            zip: object.zip,
            phone: object.phone,
            contactName: object.contactName
        }
    }

    create() {
        this.router.navigate(['admin', 'inventory', 'suppliers', 'add']);
    }

    edit(object: ISupplier) {
        this.router.navigate(['admin', 'inventory', 'suppliers', 'edit', object.id])
    }

    view(object: ISupplier) {
        this.router.navigate(['admin', 'inventory', 'suppliers', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'inventory', 'suppliers'])
    }

    cancelEdit(store: ISupplier) {
        this.router.navigate(['admin', 'inventory', 'suppliers']);
    }

    save(store: ISupplier) {
        super.save(store);

        this.router.navigate(['admin', 'inventory', 'suppliers']);
    }

    getBestSellingData(dateRange: Observable<DateRange>): Observable<Observable<ISupplier>[]> {

        return dateRange
            .switchMap(dateRange => {
                return this.socket.emitPromise('sales-data', {
                    mode: 'best-seller',
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            });
    }

    getBestSellingDataForDashboard(dateRange: Observable<DateRange>): Observable<any[]> {

        return dateRange
            .switchMap(dateRange => {
                return this.socket.emitPromise('sales-data', {
                    mode: 'best-seller',
                    limit: 5,
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                })
                    .catch(err => {
                        console.log('err: ');
                        console.log(err);
                    });
            })

    }

    downloadReport(args){
        return this.socket.emitPromise('download-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }
}
