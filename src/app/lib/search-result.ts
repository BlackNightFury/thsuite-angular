import {Observable} from "rxjs/Observable";
export class SearchResult<T> {
    constructor(public objects: Observable<T>[], public totalPages: number) {

    }
}
