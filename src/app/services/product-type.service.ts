import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {ProductType} from "../models/product-type.model";
import {IProductType} from "../models/interfaces/product-type.interface";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {SearchResult} from "../lib/search-result";
import {Router} from "@angular/router";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {DateRange} from "../lib/date-range";
import {UserService} from "./user.service";

export interface IProductTypeFilters{
    userId?: string;
}

@Injectable()
@Mixin([SearchableService])
export class ProductTypeService extends CommonService<IProductType> implements SearchableService<IProductType> {

    userService: UserService;

    constructor(injector: Injector) {
        super(injector, 'product-types');

        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
            this.userService.userEmitted.subscribe((u) => {
                if(u){
                    this.refreshEmitted.subscribe(() => {
                        this.all();
                    });
                }
            });
        });
    }

    private productTypes = new Subject<Observable<IProductType>[]>();

    all(): Observable<Observable<IProductType>[]> {

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                this.productTypes.next(objects);
            });

        return this.productTypes.asObservable()
    }

    search: (query: string, page: number) => Observable<SearchResult<IProductType>>;


    newInstance() {
        return new ProductType({
            id: uuid.v4(),
            version: 0,
            category: 'non-cannabis',
            cannabisCategory: 'NonCannabis',
            name: '',
            unitOfMeasure: '',
            notes: ''
        });
    }
    dbInstance(fromDb: IProductType) {
        return new ProductType(fromDb);
    }

    instanceForSocket(object: IProductType) {
        return {
            id: object.id,
            version: object.version,

            category: object.category,
            cannabisCategory: object.cannabisCategory,
            name: object.name,
            unitOfMeasure: object.unitOfMeasure,
            notes: object.notes
        }
    }

    create() {
        this.router.navigate(['admin', 'inventory', 'product-types', 'add']);
    }

    edit(object: IProductType) {
        this.router.navigate(['admin', 'inventory', 'product-types', 'edit', object.id])
    }

    view(object: IProductType) {
        this.router.navigate(['admin', 'inventory', 'product-types', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'inventory', 'product-types']);
    }

    cancelEdit(store: IProductType) {
        this.router.navigate(['admin', 'inventory', 'product-types']);
    }

    save(store: IProductType) {
        super.save(store);

        this.router.navigate(['admin', 'inventory', 'product-types']);
    }

    canRemove(object: IProductType): Promise<boolean>{
        return this.socket.emitPromise('canRemove', object.id);
    }

    remove(object: IProductType){
        this.socket.emitPromise('remove', object.id);
        this.router.navigate(['admin', 'inventory', 'product-types']);
    }

    getReportData(dateRange: (Observable<DateRange> | DateRange), filters?: IProductTypeFilters): Observable<Observable<IProductType>[]> {

        // Wrap direct dateRange inputs into Observable for backwards compatibility
        if (!(dateRange instanceof Observable)) {
            dateRange = Observable.of(dateRange);
        }

        return dateRange
            .switchMap(dateRange => {

                if(!dateRange.startDate || !dateRange.endDate) {
                    console.warn("dateRange start or end date is null", dateRange);
                    return [];
                }

                return this.socket.emitPromise('sales-data', {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    filters: filters
                })
                .catch(err => {
                    console.log('err: ');
                    console.log(err);
                });
            });
    }

    getBestSellingData(dateRange: Observable<DateRange>): Observable<Observable<IProductType>[]> {

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

    downloadReport(args){
        return this.socket.emitPromise('download-report', args)
            .then(response => {
                return response.Location;
            }).catch(err => {
                console.log('err: ');
                console.log(err);
            });
    }

    exportProductTypes() {
        return this.socket.emitPromise('export');
    }
}
