import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ITransaction} from "../models/interfaces/transaction.interface";
import {Transaction} from "../models/transaction.model";
import {Router} from "@angular/router";
import {DateRange} from "../lib/date-range";
import {IReceipt} from "../models/interfaces/receipt.interface";
import {TransactionService} from "./transaction.service";
import {Receipt} from "../models/receipt.model";
import {ObjectObservable} from "app/lib/object-observable";
import {UserService} from "./user.service";
import {BarcodeService} from "./barcode.service";
import {LineItemService} from "./line-item.service";
import {DrawerService} from "./drawer.service";
import {PatientService} from "./patient.service";
import {ILineItem} from "app/models/interfaces/line-item.interface";
import {Mixin} from "../lib/decorators/class/mixin";
import {SearchableService} from "./searchable.service";
import {SearchResult} from "../lib/search-result";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {ObjectSubject} from "../lib/object-subject";
import {IIncomingReceipt} from "../models/incoming-interfaces/incoming-receipt.interface";

export interface IReceiptFilters{
    paymentMethod?: string;
}

@Injectable()
@Mixin([SearchableService])
export class ReceiptService extends CommonService<IReceipt> implements SearchableService<IReceipt> {

    protected emitVoidDetailModalShowingSource = new BehaviorSubject<boolean>(undefined);
    voidDetailModalShowing = this.emitVoidDetailModalShowingSource.asObservable();

    protected emitReceiptForVoid = new BehaviorSubject<IReceipt>(undefined);
    receiptForVoid = this.emitReceiptForVoid.asObservable();

    private drawerService: DrawerService;
    private userService: UserService;
    private lineItemService: LineItemService;
    private patientService: PatientService;

    constructor(
        injector: Injector
    ) {
        super(injector, 'receipts');
        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
            this.drawerService = injector.get<DrawerService>(DrawerService);
            this.lineItemService = injector.get<LineItemService>(LineItemService);
            this.patientService = injector.get<PatientService>(PatientService);
        })
    }

    search: (query: string, page: number, sortBy: SortBy, dateRange?: DateRange ) => Observable<SearchResult<IReceipt>>;

    insert(receipt: IReceipt): Promise<any>{
        return this.socket.emitPromise('create', {receipt});
    }

    getByPatientId(patientId: string): Observable<IReceipt[]>{

        let subject = new Subject<IReceipt[]>();

        this.socket.emitPromise('getByPatientId', patientId)
            .then(ids => {
                if(ids.length){
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }else{
                    subject.next([]);
                }
            });

        return subject.asObservable();

    }

    getByBarcode(barcode: string): Observable<IReceipt> {
        let subject = new Subject<IReceipt>();

        this.socket.emitPromise('getByBarcode', {barcode})
            .then(id => {
                if (id) {
                    this.getAssociated(id)
                        .subscribe(subject);
                }
            });

        return subject.asObservable();
    }

    getByDateRange(dateRange: DateRange, filters: IReceiptFilters): Observable<IReceipt[]> {

        let subject = new Subject<IReceipt[]>();

        this.socket.emitPromise('getByDateRange', {dateRange, filters})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable()
    }

    getByDrawer(drawerId): Observable<IReceipt[]> {
        let subject = new Subject<IReceipt[]>();

        this.socket.emitPromise('getByDrawerId', {drawerId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable()
    }

    newInstance(): IReceipt {
        // throw new Error("Receipt object cannot be created on frontend");
        return new Receipt({
            id: uuid.v4(),
            version: 0,

            storeId: '',

            barcode: '',

            userId: '',

            patientId: '',
            caregiverId: '',

            paymentMethod: '',
            giftcardTransactionId: undefined,

            transactionTime: 0,

            createdAt: null,

            amountPaid: 0
        })
    }
    dbInstance(fromDb: IReceipt) {
        return new Receipt(fromDb);
    }

    instanceForSocket(object: IReceipt): IReceipt{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,
            barcode: object.barcode,

            userId: object.userId,

            patientId: object.patientId,
            Patient: object.Patient,

            caregiverId: object.caregiverId,

            paymentMethod: object.paymentMethod,
            giftcardTransactionId: object.giftcardTransactionId,

            transactionTime: object.transactionTime,
            createdAt: object.createdAt,

            drawerId: object.drawerId,

            amountPaid: object.amountPaid,
            //Note: These are dummy values --
            //if you are here because receipts are saving incorrectly, look elsewhere -- receipts from transactions don't get passed through here
            subtotal: 0,
            discount: 0,
            tax: 0,
            total: 0,
            taxByType: null,
            sentToMetrc: false
        }
    }

    resolveAssociations(receipt: IReceipt, scopes: Array<string> = ['lineItems', 'user', 'drawer', 'patient']): ObjectObservable<IReceipt> {

         // Define the rules how associations are resolved
        const scopeResolvers = {
            'lineItems': {
                // Key in parent Object => resolver function that must return observable
                'LineItems': () => this.lineItemService.getByReceiptId(receipt.id)
            },
            'user': {
                'User': () => receipt.userId ? this.userService.getAssociated(receipt.userId) : Observable.of(undefined)
            },
            'drawer': {
                'Drawer': () => receipt.drawerId ? this.drawerService.get(receipt.drawerId) : Observable.of(undefined)
            },
            'patient': {
                'Patient': () => receipt.patientId ? this.patientService.get(receipt.patientId) : Observable.of(undefined)
            },
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(receipt), receipt.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .map(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return this.mapAssociationsObject(receipt, vars, resolversToResolve);
            });

        return new ObjectObservable(obs, receipt.id);
    }

    resolveAssociationsLegacy(receipt: IReceipt): ObjectObservable<IReceipt> {

        let obs = Observable.combineLatest(
            this.lineItemService.getByReceiptId(receipt.id),
            receipt.userId ? this.userService.getAssociated(receipt.userId) : Observable.of(undefined),
            receipt.patientId ? this.patientService.get(receipt.patientId) : Observable.of(undefined),
            receipt.drawerId ? this.drawerService.get(receipt.drawerId) : Observable.of(undefined),
        ).map(([lineItems, user, patient, drawer]) => {

            receipt.LineItems = lineItems;
            receipt.User = user;
            receipt.Drawer = drawer;
            receipt.Patient = patient;

            // Resolve only device association for performance reasons
            this.drawerService.resolveAssociations(receipt.Drawer, ['device']).subscribe(enrichedDrawer => {
                if (enrichedDrawer) {
                    receipt.Drawer = enrichedDrawer;
                }
            });

            return receipt;
        });

        return new ObjectObservable(obs, receipt.id);

    }

    hideVoidDetailModal(){
        this.emitVoidDetailModalShowingSource.next(false);
    }

    showVoidDetailModal(receipt: IReceipt) {
        this.emitReceiptForVoid.next(receipt);
        this.emitVoidDetailModalShowingSource.next(true);
    }

    list() {
        this.router.navigate(['pos', 'settings', 'receipts'])
    }

    view(object: IReceipt) {
        this.router.navigate(['pos', 'settings', 'receipts', 'view', object.id])
    }

    protected updateObjectFromServer(newObject: IReceipt) {
        let [ existingSubject, isNew ] = this.getSubject(newObject.id);

        if (!existingSubject) {
            return;
        }

        let existing = this.dbInstance(newObject)
        let existingAssociated = new ObjectSubject(newObject.id);

        existingSubject.next(existing);

        this.associatedObjectMap.set(existing.id, existingAssociated);

        existingSubject
            .switchMap(obj => this.resolveAssociations(obj))
            .subscribe(existingAssociated);
    }

    refresh(receipt: IReceipt) {
        super.refresh(receipt);

        this.drawerService.refreshAssociations(receipt.drawerId)
    }

    async void(receipt: IReceipt, notes?: string) {
        await Promise.all(receipt.LineItems.map(
            async lineItem => this.lineItemService.remove(lineItem)
        ));

        return this.socket.emitPromise('remove', { receiptId: receipt.id, notes: notes });
    }
}
