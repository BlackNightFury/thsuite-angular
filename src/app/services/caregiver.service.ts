import {SearchableService} from "./searchable.service";
import {CommonService} from "./common.service";
import {ICaregiver} from "../models/interfaces/caregiver.interface";
import {Mixin} from "../lib/decorators/class/mixin";
import {Injectable, Injector} from "@angular/core";
import {Caregiver} from "../models/caregiver.model";
import {SearchResult} from "../lib/search-result";
import {Observable} from "rxjs/Observable";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {environment} from "../../environments/environment";

import * as uuid from "uuid";
import {Subject} from "rxjs/Subject";

@Injectable()
@Mixin([SearchableService])
export class CaregiverService extends CommonService<ICaregiver> implements SearchableService<ICaregiver> {

    constructor(injector: Injector){
        super(injector, 'caregivers');
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<ICaregiver>>;

    newInstance(){
        return new Caregiver({
            id: uuid.v4(),
            version: 0,

            firstName: '',
            lastName: '',

            emailAddress: '',
            phoneNumber: '',

            medicalStateId: '',

            birthday: null
        });
    }

    dbInstance(fromDb: ICaregiver){
        return new Caregiver(fromDb);
    }

    instanceForSocket(object: ICaregiver){
        return {
            id: object.id,
            version: object.version,

            firstName: object.firstName,
            lastName: object.lastName,

            emailAddress: object.emailAddress,
            phoneNumber: object.phoneNumber,

            medicalStateId: object.medicalStateId,

            birthday: object.birthday
        }
    }

    getByMedicalId(medicalId: string): Observable<ICaregiver>{
        let subject = new Subject<ICaregiver>();

        this.socket.emitPromise('getByMedicalId', medicalId)
            .then(id => {
                this.get(id)
                    .subscribe(subject);
            });

        return subject.asObservable();
    }

    create() {
        this.router.navigate(['admin', 'patients', 'caregivers', 'add']);
    }

    edit(object: ICaregiver) {
        this.router.navigate(['admin', 'patients', 'caregivers', 'edit', object.id]);
    }

    view(object: ICaregiver) {
        this.router.navigate(['admin', 'patients', 'caregivers', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'patients', 'caregivers']);
    }

    cancelEdit() {
        this.router.navigate(['admin', 'patients', 'caregivers']);
    }

    remove(caregiver: ICaregiver): Promise<void> {

        return this.socket.emitPromise('remove', caregiver.id)
            .then(() => {
                this.router.navigate(['admin', 'patients', 'caregivers']);
            });

    }

    validateMedicalId(medicalStateId: string) {
        return (medicalStateId.length == 16);
    }

    validateMedicalIdUnique(medicalStateId: string, caregiverId: string){
        return this.socket.emitPromise('validateMedicalId', {medicalStateId, caregiverId});
    }

    backToDash(){
        this.router.navigate(['admin', 'home']);
    }

    static formatCaregiverMedicalId(id: string){

        let value = id.replace(/[^a-zA-Z0-9]/g, '');

        let regex = new RegExp(environment.medicalIdRegex, 'g');

        if(!value.match(regex)){
            return value;
        }

        return value.match(regex).join(environment.medicalIdSeparator);

    }
}
