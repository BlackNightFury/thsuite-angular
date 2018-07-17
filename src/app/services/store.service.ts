import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";

import * as uuid from "uuid";

import {IStore} from "../models/interfaces/store.interface";
import {Store} from "../models/store.model";

import "rxjs/add/operator/toPromise";
import {SocketService} from "../lib/socket";
import {CommonService} from "./common.service";
import {StoreSettingsService} from "./store-settings.service";
import {Router} from "@angular/router";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscription} from "rxjs/Subscription";
import {ObjectObservable} from "../lib/object-observable";
import {UserService} from "./user.service";


@Injectable()
@Mixin([SearchableService])
export class StoreService extends CommonService<IStore> {

    private currentStoreEmittedSource: ReplaySubject<IStore> = new ReplaySubject<IStore>(1);

    currentStoreEmitted = this.currentStoreEmittedSource.asObservable();

    userService: UserService;

    constructor(injector: Injector, private storeSettingsService: StoreSettingsService) {
        super(injector, 'stores');

        this.all()
            .map(stores => stores[0])
            .subscribe(this.currentStoreEmittedSource);

        this.currentStoreEmitted
            .subscribe(currentStore => {
                console.log('currentStore', currentStore);
            });
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

    private stores = new Subject<IStore[]>();
    private existingStoreSubscription: Subscription;

    all(): Observable<IStore[]> {

        this.socket.emitPromise('all')
            .then(response => {

                if(this.existingStoreSubscription) {
                    this.existingStoreSubscription.unsubscribe();
                }

                this.existingStoreSubscription =
                    Observable.combineLatest(response.map(this.getAssociated.bind(this)))
                        .subscribe(this.stores);
            });

        return this.stores.asObservable();
    }

    search: (query: string, page: number) => Observable<SearchResult<IStore>>;

    newInstance() {
        return new Store({
            id: uuid.v4(),
            version: 0,
            name: '',
            metrcName: '',
            metrcAlias: '',
            licenseNumber: '',
            licenseType: '',
            city: '',
            state: '',
            storeManager: '',
            taxesIncluded: true,
            timeZone: ''
        });
    }

    dbInstance(fromDb: IStore) {
        return new Store(fromDb);
    }

    instanceForSocket(object: IStore): IStore{
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            metrcName: object.metrcName,
            metrcAlias: object.metrcAlias,
            licenseNumber: object.licenseNumber,
            licenseType: object.licenseType,
            city: object.city,
            state: object.state,
            storeManager: object.storeManager,
            taxesIncluded: object.taxesIncluded,
            timeZone: object.timeZone,


            //send settings object for saving
            settings: object.settings
        }
    }


    create() {
        this.router.navigate(['admin', 'store', 'locations', 'add']);
    }

    edit(object: IStore) {
        this.router.navigate(['admin', 'store', 'locations', 'edit', object.id]);
    }

    view(object: IStore) {
        this.router.navigate(['admin', 'store', 'locations', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'store', 'locations']);
    }

    cancelEdit(store: IStore) {
        this.router.navigate(['admin', 'store', 'locations']);
    }

    resolveAssociations(store: IStore): ObjectObservable<Store>{
        let obs = Observable.combineLatest(
            this.storeSettingsService.getByStoreId(store.id),
            ( storeSettings => {
                store.settings = storeSettings
                return store
            } )
        );

        return new ObjectObservable(obs, store.id);
    }

    save(store: IStore, redirect: boolean = true, customRoute?: Array<string>) {
        super.save(store, () => {
            if (redirect) {
                if (customRoute) {
                    this.router.navigate(customRoute);
                } else {
                    this.router.navigate(['admin', 'store', 'locations']);
                }
            }
        });
    }
}
