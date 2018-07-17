import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class StoreService {

    constructor() {
    }

    static exampleStores = [
        {
            id: 'all-stores',
            text: 'All Stores'
        },
        {
            id: 'some-stores',
            text: 'Some Stores'
        },
        {
            id: 'kek',
            text: 'Kek'
        }
    ];


    getStores() {

        return Observable.from([StoreService.exampleStores])
    }
}
