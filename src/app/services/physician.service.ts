import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";

import * as uuid from "uuid";

import "rxjs/add/operator/toPromise";
import {SocketService} from "../lib/socket";
import {CommonService} from "./common.service";
import {Router} from "@angular/router";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPhysician} from "../models/interfaces/physician.interface";
import {Physician} from "../models/physician.model";
import {SortBy} from "app/util/directives/sort-table-header.directive";
import {ObjectObservable} from "../lib/object-observable";


@Injectable()
@Mixin([SearchableService])
export class PhysicianService extends CommonService<IPhysician> implements SearchableService<IPhysician> {

    constructor(injector: Injector) {
        super(injector, 'physicians');
    }


    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IPhysician>>;

    newInstance() {
        return new Physician({
            id: uuid.v4(),
            version: 0,

            firstName: '',
            lastName: '',

            emailAddress: '',
            phoneNumber: '',

            clinicName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
        });
    }
    dbInstance(fromDb: IPhysician) {
        return new Physician(fromDb);
    }

    instanceForSocket(object: IPhysician) {
        return {
            id: object.id,
            version: object.version,

            firstName: object.firstName,
            lastName: object.lastName,

            emailAddress: object.emailAddress,
            phoneNumber: object.phoneNumber,

            clinicName: object.clinicName,
            address: object.address,
            city: object.city,
            state: object.state,
            zip: object.zip,
        }
    }

    remove(physician: IPhysician): Promise<void> {

        return this.socket.emitPromise('remove', physician.id)
            .then(() => {
                this.router.navigate(['admin', 'patients', 'physicians']);
            });

    }

    create() {
        this.router.navigate(['admin', 'patients', 'physicians', 'add']);
    }

    edit(object: IPhysician) {
        this.router.navigate(['admin', 'patients', 'physicians', 'edit', object.id]);
    }

    view(object: IPhysician) {
        this.router.navigate(['admin', 'patients', 'physicians', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'patients', 'physicians' ]);
    }

    cancelEdit(store: IPhysician) {
        this.router.navigate(['admin', 'patients', 'physicians']);
    }

    save(store: IPhysician, navigateToIndex: boolean = true, callback?: Function) {
        super.save(store, callback);

        if(navigateToIndex) {
            this.router.navigate(['admin', 'patients', 'physicians']);
        }
    }

    backToDash(){
        this.router.navigate(['admin', 'home']);
    }
}
