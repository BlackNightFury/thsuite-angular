import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";

import * as uuid from "uuid";

import "rxjs/add/operator/toPromise";
import {SocketService} from "../lib/socket";
import {CommonService} from "./common.service";
import {PatientService} from "./patient.service";
import {Router} from "@angular/router";
import {SearchResult} from "../lib/search-result";
import {SearchableService} from "./searchable.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPatientQueue} from "../models/interfaces/patient-queue.interface";
import {PatientQueue} from "../models/patient-queue.model";
import {IPatient} from "../models/interfaces/patient.interface";
import {Patient} from "../models/patient.model";
import {SortBy} from "app/util/directives/sort-table-header.directive";
import {ObjectObservable} from "../lib/object-observable";
import {CaregiverService} from "./caregiver.service";
import {UserService} from "./user.service";

@Injectable()
@Mixin([SearchableService])
export class PatientQueueService extends CommonService<IPatientQueue> implements SearchableService<IPatientQueue> {

    protected emitReleaseBudtenderModalPatientQueueSource = new BehaviorSubject<any>(undefined);
    releaseBudtenderModalPatientQueue = this.emitReleaseBudtenderModalPatientQueueSource.asObservable();

    protected emitReleaseBudtenderModalShowingSource = new BehaviorSubject<boolean>(undefined);
    releaseBudtenderModalShowing = this.emitReleaseBudtenderModalShowingSource.asObservable();

    constructor(injector: Injector, private patientService: PatientService, private caregiverService: CaregiverService, private userService: UserService ) {
        super(injector, 'patient-queue');
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IPatientQueue>>;

    getByPatientId(patientId: string): Observable<IPatientQueue>{
        let subject = new Subject<IPatientQueue>();

        this.socket.emitPromise('getByPatientId', patientId)
            .then(id => {
                if (id) {
                    this.get(id).subscribe(subject);
                }
            });

        return subject.asObservable();
    }

    getAll(): Observable<ObjectObservable<IPatientQueue>[]>{
        let results = new Subject<ObjectObservable<IPatientQueue>[]>();

        this.socket.emitPromise('getAll')
            .then(queueIds => {
                results.next(queueIds.map(id => this.getAssociated(id)));
            });

        return results.asObservable();
    }

    markCartStatus(patientId: string, open: boolean, budtender?: string): void{

        this.getByPatientId(patientId).take(1).subscribe(patientQueue => {

            patientQueue.cartOpen = open;
            patientQueue.budtenderId = budtender;
            this.save(patientQueue, false);

        });

    }

    addToQueue(patientId: string, caregiverId?: string, verifyAndEnter?: string, storeId?: string, source?: string): Promise<any> {
        return this.socket.emitPromise('addToQueue', {patientId, caregiverId, verifyAndEnter, storeId, source});
    }

    newInstance() {
        return new PatientQueue({
            id: uuid.v4(),
            version: 0,
            patientId: null,
            caregiverId: null,
            budtenderId: null,
            cartOpen: false,
            source: null,
            verifiedAt: null,
            enteredAt: null
        });
    }
    dbInstance(fromDb: IPatientQueue) {
        return new PatientQueue(fromDb);
    }

    instanceForSocket(object: IPatientQueue) {
        return {
            id: object.id,
            version: object.version,
            patientId: object.patientId,
            caregiverId: object.caregiverId,
            budtenderId: object.budtenderId,
            cartOpen: object.cartOpen,
            source: object.source,
            verifiedAt: object.verifiedAt,
            enteredAt: object.enteredAt
        }
    }

    resolveAssociations(patientQueue: IPatientQueue): ObjectObservable<IPatientQueue> {

        let obs = Observable.combineLatest(
            patientQueue.patientId ? this.patientService.getAssociated(patientQueue.patientId) : Observable.of(undefined),
            patientQueue.caregiverId ? this.caregiverService.get(patientQueue.caregiverId) : Observable.of(undefined),
            patientQueue.budtenderId ? this.userService.get(patientQueue.budtenderId) : Observable.of(undefined)
        ).map(([patient, caregiver, budtender]) => {

            console.log("association resolve");

            patientQueue.Patient = patient;
            patientQueue.Caregiver = caregiver;
            patientQueue.Budtender = budtender;

            return patientQueue
        });

        return new ObjectObservable(obs, patientQueue.id);

    }

    save(queue: IPatientQueue, navigateToIndex: boolean = true, callback?: Function) {
        super.save(queue, callback);

        if(navigateToIndex) {
            this.router.navigate(['admin', 'patients', 'check-in']);
        }
    }

    remove(id: string){
        this.socket.emitPromise('remove', id)
            .catch(err => {
                console.log('err');
                console.log(err);
            })
    }

    removeByPatientId(patientId: string){
        this.socket.emitPromise('removeByPatientId', patientId)
            .catch(err => {
                console.log('err: ');
                console.log(err);
            })
    }

    releasePatientFromBudtender(patientId: string, callback?: Function) {
        this.socket.emitPromise('releasePatientFromBudtender', patientId)
            .then(() => {
                if (callback) {
                    callback();
                }
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            })
    }

    viewQueue(){
        this.router.navigate(['admin', 'patients', 'check-in']);
    }

    add(){
        this.router.navigate(['admin', 'patients', 'check-in', 'add']);
    }

    backToDash(){
        this.router.navigate(['admin', 'home']);
    }

    showReleaseBudtenderModal(patientQueue: IPatientQueue, source: string){
        this.emitReleaseBudtenderModalPatientQueueSource.next({patientQueue: patientQueue, source: source});
        this.emitReleaseBudtenderModalShowingSource.next(true);
    }

    hideReleaseBudtenderModal(){
        this.emitReleaseBudtenderModalShowingSource.next(false);
    }

    releaseBudtender(patientQueue:IPatientQueue) {
        patientQueue.Budtender = null;
        patientQueue.budtenderId = null;
        patientQueue.cartOpen = null;

        this.save(patientQueue, false);
    }
}
