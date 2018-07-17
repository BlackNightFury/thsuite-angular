import {BehaviorSubject, Observable} from "rxjs";
import {ICommon} from "../models/interfaces/common.interface";

import "rxjs/add/operator/toPromise";
import {Socket, SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {ObjectSubject} from "../lib/object-subject";
import {Router} from "@angular/router";

import {cargo} from 'async';
import {Injector} from "@angular/core";
import {ZangoService} from "../lib/zango";
import * as zango from 'zangodb';
import * as AsyncLock from 'async-lock'

declare const $ : any;

export abstract class CommonService<T extends ICommon> {

    private namespace: string;
    protected socket: Socket;
    protected router: Router;
    protected zangoService: ZangoService;
    protected zangoCollection: zango.Collection;
    protected getCargo;

    constructor(injector: Injector, namespace: string) {
        this.namespace = namespace;
        this.socket = injector.get(SocketService).getSocket(namespace);
        this.router = injector.get(Router);

        // this.zangoService = injector.get(ZangoService);
        // this.zangoCollection = this.zangoService.getCollection(namespace);

        this.initializeSocket();

        this.getCargo = cargo((tasks, callback) => {

            let idSubjectMap = {};
            let idTaskMap = {};
            let nullSubjects = [];

            for(let task of tasks){
                if(task.id){
                    // Replace scopes from id
                    let id = task.id && task.id.replace ? task.id.replace(/\..+$/, '') : task.id;

                    if (!idSubjectMap[id]) {
                        idSubjectMap[id] = [];
                    }

                    idSubjectMap[id].push(task.id);
                    idTaskMap[task.id] = task.subject;
                }else{
                    //TODO shouldn't be allowed but to stop crashes for now
                    nullSubjects.push(task.subject);
                }
            }

            const ids = Object.keys(idSubjectMap);

            this.socket.emitPromise('getMany', ids)
                .then(objects => {
                    for(let obj of objects){
                        const dbObj = this.dbInstance(obj);

                        idSubjectMap[obj.id].forEach(taskId => {
                            idTaskMap[taskId].next(dbObj);
                        })
                    }

                    for(let subject of nullSubjects){
                        subject.next(null);
                    }

                    callback();

                })

        }, 1000);
    }

    protected objectMap: Map<string, ObjectSubject<T>> = new Map<string, ObjectSubject<T>>();
    protected associatedObjectMap: Map<string, ObjectSubject<T>> = new Map<string, ObjectSubject<T>>();

    private initializeSocket() {

        this.socket.on('update', this.updateObjectFromServer.bind(this));
        this.socket.on('create', this.refresh.bind(this));
        this.socket.on('remove', this.refresh.bind(this));
    }

    protected asyncLock = new AsyncLock();
    protected upsertToZango(object: T): Promise<void> {
        return;
        // if(!object) {
        //     //TODO until null object is fixed
        //     return;
        // }
        //
        // return this.asyncLock.acquire('zangodb', async () => {
        //     let existing = await this.zangoCollection.findOne({
        //         id: object.id
        //     });
        //
        //     if(existing) {
        //         await this.zangoCollection.remove({
        //             id: object.id
        //         });
        //     }
        //
        //     await this.zangoCollection.insert(object);
        // })
    }
    protected getFromZango(id: string): Promise<T> {

        return Promise.resolve(undefined);

        //TODO disable cache until tested further
        // return this.asyncLock.acquire('zangodb', () => {
        //     return this.zangoCollection.findOne({
        //         id: id
        //     })
        // })
    }

    protected getSubject(id: string): [ObjectSubject<T>, boolean] {

        if(!id) {
            console.error(new Error("Got empty id to getSubject:'" + id + "'"));
        }

        let existingSubject = this.objectMap.get(id);

        if (existingSubject) {
            return [existingSubject, false]
        }

        existingSubject = new ObjectSubject(id);
        this.objectMap.set(id, existingSubject);

        existingSubject.subscribe(this.upsertToZango.bind(this));

        return [existingSubject, true];
    }

    protected updateObjectFromServer(newObject: T) {
        console.log(`updating object from server! ${newObject.id}`);
        let existingSubject = this.objectMap.get(newObject.id);

        if (!existingSubject) {
            return;
        }

        existingSubject.next(this.dbInstance(newObject));
    }

    protected upsertObject(fromServer: boolean, newObject: T, ackCallback?: (err: any, newObject?: T) => void): Observable<T> {

        let [subject, created] = this.getSubject(newObject.id);

        subject.next(this.dbInstance(newObject));

        if (!fromServer) {

            let instanceForSocket = this.instanceForSocket(newObject);

            console.log("About to emit", instanceForSocket);
            this.socket.emitPromise('update', instanceForSocket)
                .then(() => {
                    this.refresh(newObject);
                    if(ackCallback) {
                        ackCallback(null, newObject)
                    }
                })
                .catch(err => {
                    if(ackCallback) {
                        ackCallback(err)
                    }
                });
            newObject.version += 1
        }

        return subject.asObservable();
    }

    //NEVER use the associated objects with objects emitted from this observable
    get(id: string): ObjectObservable<T> {

        let [subject, created] = this.getSubject(id);


        if (created) {

            this.getFromZango(id)
                .then(object => {
                    if(object) {
                        subject.next(object);
                    }
                    else {
                        this.getCargo.push({id, subject});
                    }

                })


        }

        return subject.asObservable();
    }

    getAssociated(id: string, scopes?: Array<string>): ObjectObservable<T> {

        const key = scopes && scopes.length ? `${id}.${scopes.join('-')}` : id;

        let existingAssociated = this.associatedObjectMap.get(key);
        if (existingAssociated) {
            return existingAssociated.asObservable();
        }

        const existing = this.get(id);

        existingAssociated = new ObjectSubject(key);
        this.associatedObjectMap.set(key, existingAssociated);

        existing
            // Due to the nature of javascript, 2nd argument `scopes` will be ignored for those services who doesn't support it now.
            // For the same reason it's not possible to call resolveAssociations() directly anymore, because Typescript complains about arguments mismatch.
            .switchMap(obj => this.resolveAssociations(obj, scopes))
            .subscribe(existingAssociated);

        return existingAssociated.asObservable();
    }

    refreshAssociations(id: string) {
        let existing = this.objectMap.get(id);
        if (existing) {
            existing.next(existing.lastValue)
        }
    }

    abstract newInstance(): T

    abstract dbInstance(fromDb: T): T;

    abstract instanceForSocket(object: T): T

    resolveAssociations(obj: T, scopes?: string[]): ObjectObservable<T> {
        return new ObjectObservable(Observable.of(obj), obj.id);
    }

    save(object: T, callback?, skipNotification?, alertOnError?, customSaveMessage?: string) {
        console.log(customSaveMessage);
        this.upsertObject(false, object, ((err, newObject) => {
            if (err) {
                if (!skipNotification) {
                    $.notify(`Failed to save`, "error");
                    console.log(err);
                }
                if(alertOnError){
                    alert(err);
                }
            } else {
                if (!skipNotification) {
                    if (customSaveMessage){
                        $.notify(customSaveMessage, "success");
                    } else {
                        $.notify(`Saved successfully`, "success");
                    }
                }

                if (callback) {
                    callback();
                }
            }
        }));
    }

    protected emitRefreshSource = new BehaviorSubject<void>(undefined);
    refreshEmitted = this.emitRefreshSource.asObservable();

    refresh(object: T) {
        console.log("Refreshing!");
        console.log(object);
        this.emitRefreshSource.next(undefined);
    }

    protected handleError(error: any): Promise<any> {
        console.error("An error occurred", error);
        return Promise.reject(error.message || error);
    }

    resolveAssociationsObservables(scopeResolvers: Array<any>): Observable<any> {
        const observables = scopeResolvers.map(scopeResolver => {
            const fn = scopeResolver[Object.keys(scopeResolver)[0]];
            return fn[Object.keys(fn)[0]]();
        });

        return Observable.combineLatest(observables);
    }

    mapAssociationsObject(item: ICommon, vars: {}, resolversToResolve: Array<any>): ICommon {
        resolversToResolve.forEach(scopeResolver => {
            const key = Object.keys(scopeResolver)[0];
            const index = Object.keys(scopeResolver[key])[0];

            item[index] = vars[key];
        });

        return item;
    }

    parseScopeResolvers(scopeResolvers, scopes: Array<string>) {

        let scopesToResolve = Object.keys(scopeResolvers);

        if (Array.isArray(scopes)) {
            scopesToResolve = scopesToResolve.filter(scopeResolverKey => scopes.indexOf && scopes.indexOf(scopeResolverKey) > -1 ? true : false);
        } /*else {
            console.log('scopes are not array!', scopes);
        }*/

        const resolversToResolve = scopesToResolve.map(scopeResolverKey => { return { [scopeResolverKey]: scopeResolvers[scopeResolverKey] } });

        return { scopesToResolve, resolversToResolve };
    }

    createScopeVars(scopesToResolve: Array<any>, args: Array<any>) {
        let vars = {};
        scopesToResolve.forEach((scopeResolverKey, index) => vars[scopeResolverKey] = args[index]);

        return vars;
    }
}
