import {ICommon} from "../models/interfaces/common.interface";
import {ReplaySubject} from "rxjs";
import {ObjectObservable} from "./object-observable";

export class ObjectSubject<T extends ICommon> extends ReplaySubject<T> {

    id: string;
    lastValue: any;

    constructor(id: string) {
        super(1);
        // Replace scope part from id
        this.id = id && id.replace ? id.replace(/\..+$/, '') : id;

        this.subscribe(
            (obj: T) => {this.lastValue = obj}
        );
    }

    asObservable(): ObjectObservable<T> {
        return new ObjectObservable(super.asObservable(), this.id);
    }
}
