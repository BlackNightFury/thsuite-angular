import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";

import * as uuid from "uuid";

import {IStore} from "../models/interfaces/store.interface";
import {Store} from "../models/store.model";

import "rxjs/add/operator/toPromise";
import {SocketService} from "../lib/socket";
import {CommonService} from "./common.service";
import {Router} from "@angular/router";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPatientGroup} from "../models/interfaces/patient-group.interface";
import {PatientGroup} from "../models/patient-group.model";
import {UserService} from "./user.service";


@Injectable()
@Mixin([SearchableService])
export class PatientGroupService extends CommonService<IPatientGroup> {

    userService: UserService;

    constructor(injector: Injector) {
        super(injector, 'patient-groups');

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

    private patientGroups = new Subject<Observable<IPatientGroup>[]>();

    all(): Observable<Observable<IPatientGroup>[]> {

        this.socket.emitPromise('all')
            .then(response => {
                let objects = response.map(this.getAssociated.bind(this));

                this.patientGroups.next(objects);
            });

        return this.patientGroups.asObservable();
    }

    search: (query: string, page: number) => Observable<SearchResult<IPatientGroup>>;

    newInstance() {
        return new PatientGroup({
            id: uuid.v4(),
            version: 0,
            name: '',
            description: ''
        });
    }
    dbInstance(fromDb: IPatientGroup) {
        return new PatientGroup(fromDb);
    }

    instanceForSocket(object: IPatientGroup) {
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            description: object.description
        }
    }

    patientsInGroup(patientGroup: IPatientGroup): Observable<boolean>{
        let result = new Subject<boolean>();
        this.socket.emitPromise('patientsInGroup', patientGroup.id)
            .then(response => {
                result.next(response);
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });

        return result.asObservable();
    }

    create() {
        this.router.navigate(['admin', 'patients', 'patient-groups', 'add']);
    }

    edit(object: IPatientGroup) {
        this.router.navigate(['admin', 'patients', 'patient-groups', 'edit', object.id]);
    }

    view(object: IPatientGroup) {
        this.router.navigate(['admin', 'patients', 'patient-groups', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'patients', 'patient-groups']);
    }

    cancelEdit(store: IPatientGroup) {
        this.router.navigate(['admin', 'patients', 'patient-groups']);
    }

    save(store: IPatientGroup) {
        super.save(store);

        this.router.navigate(['admin', 'patients', 'patient-groups']);
    }

    remove(patientGroup: IPatientGroup): Promise<void> {

        return this.socket.emitPromise('remove', patientGroup.id)
            .then(() => {
                this.router.navigate(['admin', 'patients', 'patient-groups']);
            });

    }
}
