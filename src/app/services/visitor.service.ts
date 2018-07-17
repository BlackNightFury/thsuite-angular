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
import {IVisitor} from "../models/interfaces/visitor.interface";
import {Visitor} from "../models/visitor.model";
import {SortBy} from "app/util/directives/sort-table-header.directive";
import {ObjectObservable} from "../lib/object-observable";

@Injectable()
@Mixin([SearchableService])
export class VisitorService extends CommonService<IVisitor> implements SearchableService<IVisitor> {

    protected emitAddEditVisitorModalVisitorSource = new BehaviorSubject<any>(undefined);
    addEditVisitorModalVisitor = this.emitAddEditVisitorModalVisitorSource.asObservable();

    protected emitAddEditVisitorModalShowingSource = new BehaviorSubject<boolean>(undefined);
    addEditVisitorModalShowing = this.emitAddEditVisitorModalShowingSource.asObservable();

    protected emitVisitorIdModalVisitorSource = new BehaviorSubject<any>(undefined);
    visitorIdModalVisitor = this.emitVisitorIdModalVisitorSource.asObservable();

    protected emitVisitorIdModalShowingSource = new BehaviorSubject<boolean>(undefined);
    visitorIdModalShowing = this.emitVisitorIdModalShowingSource.asObservable();

    protected emitVisitorCheckoutModalVisitorSource = new BehaviorSubject<any>(undefined);
    visitorCheckoutModalVisitor = this.emitVisitorCheckoutModalVisitorSource.asObservable();

    protected emitVisitorCheckoutModalShowingSource = new BehaviorSubject<boolean>(undefined);
    visitorCheckoutModalShowing = this.emitVisitorCheckoutModalShowingSource.asObservable();

    //TODO: Look at moving this to server
    protected visitReasons = [
        "Contractor",
        "Tour",
        "Vendor",
        "Cleaning",
        "Owner visitor"
    ];

    constructor(injector: Injector) {
        super(injector, 'visitors');
    }

    search: (query: string, page: number, sortBy: SortBy) => Observable<SearchResult<IVisitor>>;

    newInstance() {
        return new Visitor({
            id: uuid.v4(),
            version: 0,

            firstName: '',
            lastName: '',

            clockIn: new Date(),
            clockOut: null,

            autoClockedOut: false,
        
            visitReason: null,
            idImage: null,
            signature:null
        });
    }
    dbInstance(fromDb: IVisitor) {
        return new Visitor(fromDb);
    }

    instanceForSocket(object: IVisitor) {
        return {
            id: object.id,
            version: object.version,

            firstName: object.firstName,
            lastName: object.lastName,

            clockIn: object.clockIn,
            clockOut: object.clockOut,

            autoClockedOut : object.autoClockedOut,
        
            visitReason: object.visitReason,
            idImage: object.idImage,
            signature:object.signature
        }
    }

    remove(visitor: IVisitor): Promise<void> {

        return this.socket.emitPromise('remove', visitor.id)
            .then(() => {
                this.router.navigate(['admin', 'patients', 'visitors']);
            });

    }

    create() {
        this.router.navigate(['admin', 'patients', 'visitors', 'add']);
    }

    edit(object: IVisitor) {
        this.router.navigate(['admin', 'patients', 'visitors', 'edit', object.id]);
    }

    view(object: IVisitor) {
        this.router.navigate(['admin', 'patients', 'visitors', 'view', object.id]);
    }

    list() {
        this.router.navigate(['admin', 'patients', 'visitors' ]);
    }

    cancelEdit(store: IVisitor) {
        this.router.navigate(['admin', 'patients', 'visitors']);
    }

    save(store: IVisitor, navigateToIndex: boolean = true, callback?: Function) {
        super.save(store, callback);

        if(navigateToIndex) {
            this.router.navigate(['admin', 'patients', 'visitors']);
        }
    }

    backToDash(){
        this.router.navigate(['admin', 'home']);
    }

    showAddEditVisitorModal(visitor: IVisitor, source: string){
        this.emitAddEditVisitorModalVisitorSource.next({visitorId:visitor.id, source:source});
        this.emitAddEditVisitorModalShowingSource.next(true);
    }

    hideAddEditVisitorModal(){
        this.emitAddEditVisitorModalShowingSource.next(false);
    }

    showVisitorIdModal(visitor: IVisitor, source: string, mode: string){
        this.emitVisitorIdModalVisitorSource.next({visitorId:visitor.id, source:source, mode: mode});
        this.emitVisitorIdModalShowingSource.next(true);
    }

    hideVisitorIdModal(){
        this.emitVisitorIdModalShowingSource.next(false);
    }

    showVisitorCheckoutModal(visitor: IVisitor, source: string){
        this.emitVisitorCheckoutModalVisitorSource.next({visitorId:visitor.id, source:source});
        this.emitVisitorCheckoutModalShowingSource.next(true);
    }

    hideVisitorCheckoutModal(){
        this.emitVisitorCheckoutModalShowingSource.next(false);
    }

    getVisitReasons(){
        return this.visitReasons.slice(); //Returns a copy of the array
    }

    getUploadParams(contentType: string): Promise<any> {
        return this.socket.emitPromise('get-s3-upload-params', {contentType});
    }
}
