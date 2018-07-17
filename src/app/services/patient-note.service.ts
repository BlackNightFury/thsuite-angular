import {Injectable, Injector} from "@angular/core";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {ObjectObservable} from "../lib/object-observable";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IPatientNote} from "../models/interfaces/patient-note.interface";
import {PatientNote} from "../models/patient-note.model";
import {UserService} from "./user.service";
import * as moment from "moment";

@Injectable()
export class PatientNoteService extends CommonService<IPatientNote>{

    private userService: UserService;

    constructor(
        injector: Injector
    ){
        super(injector, 'patient-notes');
        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
        })
    }

    newInstance(){
        return new PatientNote({
            id: uuid.v4(),
            version: 0,
            patientId: undefined,
            authorId: undefined,
            note: '',
            createdAt: moment.utc().toDate()
        });
    }

    dbInstance(fromDb: IPatientNote){
        return new PatientNote(fromDb);
    }

    instanceForSocket(object: IPatientNote){
        return {
            id: object.id,
            version: object.version,

            patientId: object.patientId,
            authorId: object.authorId,
            note: object.note,
            createdAt: object.createdAt
        }
    }

    getByPatientId(patientId: string): Observable<ObjectObservable<IPatientNote>[]>{

        let subject = new Subject<ObjectObservable<IPatientNote>[]>();

        this.socket.emitPromise('getByPatientId', patientId)
            .then(ids => {
                subject.next(ids.map(id => this.getAssociated(id)));
            })
            .catch(err => {
                console.log('err');
                console.log(err);
            });

        return subject.asObservable();

    }

    resolveAssociations(patientNote: IPatientNote, scopes: Array<string> = ['user']) : ObjectObservable<IPatientNote>{
        let obs = this.userService.get(patientNote.authorId)
            .map((author) => {
                patientNote.Author = author;

                return patientNote;
            });

        return new ObjectObservable(obs, patientNote.id);
    }

}
