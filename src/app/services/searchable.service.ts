import {Observable} from "rxjs";
import {SearchResult} from "../lib/search-result";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Socket} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {ICommon} from "../models/interfaces/common.interface";
import {SortBy} from "../util/directives/sort-table-header.directive";


export class SearchableService<T extends ICommon> {

    search(query, page, sortBy: SortBy, extraArgs = {}): Observable<SearchResult<T>> {
        const thisSocket: Socket = this['socket'];
        const thisRefreshEmitted: Observable<void> = this['refreshEmitted'];
        const thisGetAssociated: (id: string) => ObjectObservable<T> = this['getAssociated'];


        let args: any = {};
        Object.assign(args, extraArgs);
        args.query = query;
        args.page = page;
        args.sortBy = sortBy;
        return thisRefreshEmitted.startWith(null).switchMap(() => {
            return thisSocket.emitPromise('search', args)
                .then(response => {
                    let objects = response.objects.map(thisGetAssociated.bind(this));

                    return new SearchResult(objects, response.numPages)
                })
        });
    }
}
