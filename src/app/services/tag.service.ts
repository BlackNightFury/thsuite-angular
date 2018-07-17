import {Injectable, Injector} from "@angular/core";
import {CommonService} from "./common.service";
import {SearchableService} from "./searchable.service";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";

import {ITag} from "../models/interfaces/tag.interface";
import {Tag} from "../models/tag.model";

import * as uuid from "uuid";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {ObjectObservable} from "../lib/object-observable";
import {Mixin} from "../lib/decorators/class/mixin";
import {Subject} from "rxjs/Subject";
import {DateRange} from "../lib/date-range";

@Injectable()
@Mixin([SearchableService])
export class TagService extends CommonService<ITag> implements SearchableService<ITag>{

    constructor(injector: Injector){
        super(injector, 'tags');
    }

    search: (query: string, page: number, sortBy: SortBy, storeId: string) => Observable<SearchResult<ITag>>;

    newInstance(){
        return new Tag({
            id: uuid.v4(),
            version: 0,
            storeId: null,
            value: ''
        });
    }

    dbInstance(fromDb: ITag){
        return new Tag(fromDb);
    }

    instanceForSocket(object: ITag): ITag{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,
            value: object.value
        };
    }

    getByLoyaltyRewardId(loyaltyRewardId: string): Observable<ITag[]>{
        let subject = new Subject<ITag[]>();

        this.socket.emitPromise('getByLoyaltyRewardId', {loyaltyRewardId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);

            });

        return subject.asObservable();
    }

    getByProductVariationId(productVariationId: string): Observable<ITag[]>{
        let subject = new Subject<ITag[]>();

        this.socket.emitPromise('getByProductVariationId', {productVariationId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);

            });

        return subject.asObservable();
    }

    getByProductId(productId: string): Observable<ITag[]>{
        let subject = new Subject<ITag[]>();

        this.socket.emitPromise('getByProductId', {productId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);

            });

        return subject.asObservable();
    }

    getByStoreId(storeId: string): Observable<ObjectObservable<ITag>[]>{
        let results = new Subject<ObjectObservable<ITag>[]>();
        this.socket.emitPromise('getByStoreId', {storeId})
            .then(tagIds => {
                results.next(tagIds.map(id => this.get(id)));
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    create(){
        this.router.navigate(['admin', 'store', 'tags', 'add']);
    }

    edit(tag: ITag){
        this.router.navigate(['admin', 'store', 'tags', 'edit', tag.id]);
    }

    view(tag: ITag){
        this.router.navigate(['admin', 'store', 'tags', 'view', tag.id]);
    }

    list(){
        this.router.navigate(['admin', 'store', 'tags']);
    }

    remove(tag: ITag){
        this.socket.emitPromise('remove', tag.id);
        this.router.navigate(['admin', 'store', 'tags']);
    }
}
