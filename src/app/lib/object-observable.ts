import {ICommon} from "../models/interfaces/common.interface";
import {Observable} from "rxjs";

export class ObjectObservable<T extends ICommon> extends Observable<T> {

    id: string;

    constructor(observable: ObjectObservable<T>)
    constructor(observable: Observable<T>, id: string)
    constructor(observable: Observable<T>, id?: string) {
        super();

        if(observable instanceof ObjectObservable) {
            this.source = observable;
            this.id = observable.id;
        }
        else {
            this.source = observable;
            this.id = id;
        }
    }
}
