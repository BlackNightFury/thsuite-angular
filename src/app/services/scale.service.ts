import {CommonService} from "./common.service";
import {IScale} from "../models/interfaces/scale.interface";
import {SearchableService} from "./searchable.service";
import {SocketService} from "../lib/socket";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Router} from "@angular/router";
import {Scale} from "../models/scale.model";
import {Mixin} from "../lib/decorators/class/mixin";
import {Injectable, Injector} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {DeviceProxyService} from "app/services/device-proxy.service";

@Injectable()
@Mixin([SearchableService])
export class ScaleService extends CommonService<IScale> implements SearchableService<IScale>{

    private scaleSource = new Subject<any>();
    scaleDataEmitted = this.scaleSource.asObservable();

    private scaleRegisteredSource = new Subject<any>();
    scaleRegisteredEmitted = this.scaleRegisteredSource.asObservable();

    constructor(injector: Injector, private deviceProxyService: DeviceProxyService){
        super(injector, 'scales');
        deviceProxyService.scaleEmitTo(this.scaleSource);
    }

    all(): Observable<IScale[]>{

        let result = new Subject<Observable<IScale>[]>();

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                result.next(objects);
            });

        return result.asObservable().switchMap((scaleObservables) => {
            if(scaleObservables.length) {
                return Observable.combineLatest(scaleObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    allEnabled(): Observable<IScale[]>{

        let result = new Subject<Observable<IScale>[]>();

        this.socket.emitPromise('allEnabled')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                result.next(objects);
            });

        return result.asObservable().switchMap((scaleObservables) => {
            if(scaleObservables.length) {
                return Observable.combineLatest(scaleObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IScale>>;

    newInstance(): IScale{
        throw new Error("Scale object cannot be created on frontend");
    }

    dbInstance(fromDb: IScale){
        return new Scale(fromDb);
    }

    instanceForSocket(object: IScale): IScale{
        return {
            id: object.id,
            version: object.version,

            deviceProxyId: object.deviceProxyId,
            port: object.port,
            name: object.name,

            isEnabled: object.isEnabled
        }
    }

    registered(){
        this.scaleRegisteredSource.next(undefined);
    }
}
