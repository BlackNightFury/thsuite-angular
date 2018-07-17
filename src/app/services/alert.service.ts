import {Injectable, Injector} from "@angular/core";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {IAdjustment} from "../models/interfaces/adjustment.interface";
import {Adjustment} from "../models/adjustment.model";
import {PackageService} from "./package.service";
import {IAlert} from "../models/interfaces/alert.interface";
import {Alert} from "../models/alert.model";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";

@Injectable()
@Mixin([SearchableService])
export class AlertService extends CommonService<IAlert> implements SearchableService<IAlert>{

    alertCountSource: BehaviorSubject<number> = new BehaviorSubject(0);
    alertCountEmitted: Observable<number> = this.alertCountSource.asObservable();

    constructor(injector: Injector){
        super(injector, 'alerts');

        this.updateAlertCount();
    }

    search: (query: string, page: number) => Observable<SearchResult<IAlert>>;

    updateAlertCount() {
        this.socket.emitPromise('get-alert-count')
            .then(count => this.alertCountSource.next(count));
    }

    newInstance(): IAlert {
        throw new Error("Alert instance cannot be created on frontend");
    }

    dbInstance(fromDb: IAlert) {
        return new Alert(fromDb);
    }

    instanceForSocket(object: IAlert) {
        return {
            id: object.id,
            version: object.version,
            title: object.title,
            description: object.description,
            url: object.url,
            type: object.type,

            createdAt: object.createdAt,

            typeFormatted: '',
        }
    }

    save(alert: IAlert){
        super.save(alert);
    }

    refresh(alert: IAlert) {
        super.refresh(alert);

        this.updateAlertCount();
    }

}
