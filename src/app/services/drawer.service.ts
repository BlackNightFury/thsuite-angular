import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, ReplaySubject, Subject, Subscription} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ReceiptService} from "./receipt.service";
import {Router} from "@angular/router";
import {IDrawer} from "../models/interfaces/drawer.interface";
import {IUser} from "../models/interfaces/user.interface";
import {Drawer} from "../models/drawer.model";
import {ObjectObservable} from "app/lib/object-observable";

import {DeviceService} from "./device.service";
import {DrawerLogService} from "./drawer-log.service";
import {UserService} from "./user.service";
import {DrawerRemovalService} from "./drawer-removal.service";
import {StoreService} from "./store.service";
import {Package} from "../models/package.model";

@Injectable()
export class DrawerService extends CommonService<IDrawer> {

    protected emitDrawerStartModalShowingSource = new BehaviorSubject<boolean>(undefined);
    drawerStartModalShowing = this.emitDrawerStartModalShowingSource.asObservable();

    protected emitDrawerForStart = new BehaviorSubject<IDrawer>(undefined);
    drawerForStart = this.emitDrawerForStart.asObservable();

    protected emitDrawerEndModalShowingSource = new BehaviorSubject<boolean>(undefined);
    drawerEndModalShowing = this.emitDrawerEndModalShowingSource.asObservable();

    protected emitDrawerForEnd = new BehaviorSubject<IDrawer>(undefined);
    drawerForEnd = this.emitDrawerForEnd.asObservable();

    private drawerEmittedSource = new ReplaySubject<IDrawer>(undefined);
    drawerEmitted = this.drawerEmittedSource.asObservable();

    private checkDrawerSource = new ReplaySubject<boolean>(undefined);
    checkDrawerEmitted = this.checkDrawerSource.asObservable();

    protected emitExplainDrawerNavigationSource = new BehaviorSubject<boolean>(undefined);
    explainDrawerNavigationShowing = this.emitExplainDrawerNavigationSource.asObservable();

    protected drawerLimitReachedCheckEmittedSource = new BehaviorSubject<boolean>(undefined);
    drawerLimitReachedCheckEmitted = this.drawerLimitReachedCheckEmittedSource.asObservable();

    private userService: UserService;
    private deviceService: DeviceService;

    user: IUser

    constructor(
        injector: Injector,
        private drawerLogService: DrawerLogService,
        private drawerRemovalService: DrawerRemovalService,
        private receiptService: ReceiptService,
        private storeService: StoreService
    ) {
        super(injector, 'drawers');

        setTimeout(() => {
            this.deviceService = injector.get<DeviceService>(DeviceService);
            this.userService = injector.get<UserService>(UserService);
            this.userService.userEmitted.subscribe(user => {
                this.user = user;
            });
        })
    }

    afterClose() {
        this.getCurrent(true, localStorage.getItem('deviceId')).subscribe(drawer => {
            this.checkDrawerSource.next(true);
        })
    }

    insert(drawer: IDrawer): Promise<any>{
        return this.socket.emitPromise('create', {drawer})
        .then( ( { success, savedDrawer } ) => {
            drawer.createdAt = savedDrawer.createdAt
            return Promise.resolve(drawer)
        } )
    }

    getCurrent(createIfNull: boolean, deviceId?: string): Observable<IDrawer> {
        let subject = new Subject<IDrawer>();

        this.socket.emitPromise('getCurrent', {deviceId: deviceId || localStorage.getItem('deviceId')})
            .then(id => {
                if(id === null ) { return createIfNull ? subject.next(this.newInstance()) : subject.next(null) }
                this.getAssociated(id)
                    .subscribe(subject);
            });

        return subject.asObservable();
    }

    getUserDrawersForDay(): Observable<IDrawer[]> {
        const drawers = new Subject<IDrawer[]>();

        this.userService.userEmitted.subscribe( user => {
            this.socket.emitPromise('get-user-drawers-for-day', {userId:user.id} )
                .then(response =>
                    drawers.next(response.map(this.getAssociated.bind(this)))
                );
        })

        return drawers.asObservable().switchMap((drawerObservables) => {
            if(drawerObservables.length) {
                return Observable.combineLatest(drawerObservables)
            }else{
                return Observable.of([]);
            }
        })
    }

    newInstance(): IDrawer {
        return new Drawer({
            id: uuid.v4(),
            version: 0,
            deviceId: localStorage.getItem('deviceId'),
            startingAmount: null,
            endingAmount: null,
            notesForCloser: '',
            createdAt: null,
            userId: '',
            closedAt: null,
            closedByUserId: null
        })
    }

    dbInstance(fromDb: IDrawer) {
        return new Drawer(fromDb);
    }

    instanceForSocket(object: IDrawer) {
        return {
            id: object.id,
            version: object.version,

            deviceId: object.deviceId,
            startingAmount: object.startingAmount,
            endingAmount: object.endingAmount,
            notesForCloser: object.notesForCloser,
            createdAt: object.createdAt,
            userId: object.userId,

            cashAmount: 0,
            totalSalesTaxIncluded: 0,
            totalSalesTaxExcluded: 0,
            currentBalance: 0,

            closedAt: object.closedAt,
            closedByUserId: object.closedByUserId
        }
    }

    getHistory(drawerId) {
        this.socket.emitPromise('getHistory', {drawerId})
    }

    open(explainNavigation?: Boolean) {
        console.log("Open called!");
        this.router.navigate(['pos', 'settings', 'drawer'])
        if(explainNavigation) this.emitExplainDrawerNavigationSource.next(true)
    }

    getDrawerClosingReport(userId: string = undefined, deviceId: string = undefined, selectedDate: string) {
        return this.socket.emitPromise('drawer-closing-report', {userId, deviceId, selectedDate});
    }

    resolveAssociations(drawer: IDrawer, scopes: Array<string> = ['receipts', 'user', 'log', 'device', 'drawer-removals']): ObjectObservable<IDrawer> {
        console.log("resolve associations");
        // Define the rules how associations are resolved
        const scopeResolvers = {
            'receipts': {
                // Key in parent Object => resolver function that must return observable
                'Receipts': () => this.receiptService.getByDrawer(drawer.id)
            },
            'user': {
                'User': () => drawer.userId ? this.userService.getAssociated(drawer.userId) : Observable.of(undefined)
            },
            'log': {
                'Log': () => this.drawerLogService.getByDrawerId(drawer.id)
            },
            'device': {
                'Device': () => drawer.deviceId ? this.deviceService.get(drawer.deviceId) : Observable.of(undefined)
            },
            'drawer-removals':{
                'DrawerRemovals': () => this.drawerRemovalService.getByDrawerId(drawer.id)
            }
        };

        const {scopesToResolve, resolversToResolve} = this.parseScopeResolvers(scopeResolvers, scopes);

        console.log(scopesToResolve);

        if (scopesToResolve.length < 1) {
            return new ObjectObservable(Observable.of(drawer), drawer.id);
        }

        const obs = this.resolveAssociationsObservables(resolversToResolve)
            .switchMap(args => {
                const vars = this.createScopeVars(scopesToResolve, args);
                return Observable.of(this.mapAssociationsObject(drawer, vars, resolversToResolve));
            });

        return new ObjectObservable(obs, drawer.id);
    }

    resolveAssociationsLegacy(drawer: IDrawer): ObjectObservable<IDrawer> {

        let obs = Observable.combineLatest(
            this.receiptService.getByDrawer(drawer.id),
            drawer.userId ? this.userService.getAssociated(drawer.userId) : Observable.of(undefined),
            this.drawerLogService.getByDrawerId(drawer.id),
            drawer.deviceId ? this.deviceService.get(drawer.deviceId) : Observable.of(undefined)
        ).map(([receipts, user, log, device]) => {
            drawer.Receipts = receipts;
            drawer.User = user;
            drawer.Log = log;
            drawer.Device = device;

            return drawer;
        });

        return new ObjectObservable(obs, drawer.id);
    }

    hideDrawerStartModal(){
        this.emitDrawerStartModalShowingSource.next(false);
    }

    showDrawerStartModal(drawer: IDrawer) {
        this.emitDrawerForStart.next(drawer);
        this.emitDrawerStartModalShowingSource.next(true);
    }

    hideDrawerEndModal(){
        this.emitDrawerEndModalShowingSource.next(false);
    }

    showDrawerEndModal(drawer: IDrawer) {
        this.emitDrawerForEnd.next(drawer);
        this.emitDrawerEndModalShowingSource.next(true);
    }

    hideExplainDrawerNavigationModal() {
        this.emitExplainDrawerNavigationSource.next(false)
    }

    settingDrawerLimitCheck(isAboveLimit: boolean){
        this.drawerLimitReachedCheckEmittedSource.next(isAboveLimit);
    }

    update(drawer: IDrawer): Promise<any>{
        return this.socket.emitPromise('update', Object.assign( {
            id: drawer.id,
            version: drawer.version,
            deviceId: drawer.deviceId,
            userId: drawer.userId,
            startingAmount: drawer.startingAmount,
            endingAmount: drawer.endingAmount,
            notesForCloser: drawer.notesForCloser,
            closedAt: drawer.closedAt,
            closedByUserId: drawer.closedByUserId
        } ) )
    }

    showClosingReport() {
        this.router.navigate(['pos', 'settings', 'drawer-closing-report'])
    }
}
