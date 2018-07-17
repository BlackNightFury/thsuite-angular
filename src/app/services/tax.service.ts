import {Mixin} from "app/lib/decorators/class/mixin";
import {Injectable, Injector} from "@angular/core";
import {SearchableService} from "./searchable.service";
import {CommonService} from "./common.service";
import {Router} from "@angular/router";
import {SocketService} from "../lib/socket";
import {ITax} from "../models/interfaces/tax.interface";
import {Observable} from "rxjs/Observable";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {SearchResult} from "../lib/search-result";
import {Tax} from "../models/tax.model";
import * as uuid from "uuid";
import {ObjectObservable} from "app/lib/object-observable";
import {Subject} from "rxjs/Subject";

@Injectable()
@Mixin([SearchableService])
export class TaxService extends CommonService<ITax> implements SearchableService<ITax> {

    constructor(injector: Injector) {
        super(injector, 'taxes');
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<ITax>>;

    newInstance(){
        return new Tax({
            id: uuid.v4(),
            version: 0,
            name: '',
            percent: 0,
            // cannabisOnly: false
            appliesToCannabis: false,
            appliesToNonCannabis: false
        });
    }

    dbInstance(fromDb: ITax){
        return new Tax(fromDb);
    }

    instanceForSocket(object: ITax): ITax{
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            percent: object.percent,
            // cannabisOnly: object.cannabisOnly
            appliesToCannabis: object.appliesToCannabis,
            appliesToNonCannabis: object.appliesToNonCannabis
        };
    }

    // private taxes = new Subject<Observable<ITax>[]>();

    all(): Observable<ITax[]> {
        let subject = new Subject<Observable<ITax>[]>();
        this.socket.emitPromise('all')
            .then(response => {
                console.log(response);
                let objects = response.map(this.getAssociated.bind(this));

                subject.next(objects);
            });

        return subject.asObservable().switchMap((taxObservables) => {
            if(taxObservables.length) {
                return Observable.combineLatest(taxObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    allWithDeleted(): Observable<ITax[]>{
        let subject = new Subject<Observable<ITax>[]>();
        this.socket.emitPromise('allTaxesDeleted')
            .then(response => {
                console.log(response);
                let objects = response.map(this.getAssociated.bind(this));

                subject.next(objects);
            });

        return subject.asObservable().switchMap((taxObservables) => {
            if(taxObservables.length) {
                return Observable.combineLatest(taxObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    create() {
        this.router.navigate(['admin', 'store', 'taxes', 'add']);
    }

    edit(object: ITax) {
        //Edit will actually trigger a remove on the edit object and redirect to add with query string
        let queryString = `?name=${object.name}&percent=${object.percent}&appliesToCannabis=${object.appliesToCannabis}&appliesToNonCannabis=${object.appliesToNonCannabis}&oldId=${object.id}`;
        let url = "/admin/store/taxes/add" + queryString;

        // this.socket.emitPromise('remove', object.id);
        this.router.navigateByUrl(url);
    }

    view(object: ITax) {
        this.router.navigate(['admin', 'store', 'taxes', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'store', 'taxes']);
    }

    export( args ) {
        return this.socket.emitPromise('export', args);
    }

    save(object: ITax){
        super.save(object);

        this.router.navigate(['admin', 'store', 'taxes']);
    }

    remove(object: ITax){
        this.socket.emitPromise('remove', object.id);
    }

    removeById(taxId: string){
        this.socket.emitPromise('remove', taxId);
    }
}
