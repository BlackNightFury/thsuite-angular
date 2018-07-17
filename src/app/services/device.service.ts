import {Injectable, Injector} from "@angular/core";
import {Observable, BehaviorSubject, Subject, Subscription} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {IDevice} from "../models/interfaces/device.interface";
import {Device} from "../models/device.model";
import {ObjectObservable} from "app/lib/object-observable";
import {DrawerService} from "./drawer.service";
import {UserService} from "./user.service";

@Injectable()
export class DeviceService extends CommonService<IDevice> {

    private userService: UserService;
    private drawerService: DrawerService;

    constructor(injector: Injector) {
        super(injector, 'devices');
        setTimeout(() => {
            this.userService = injector.get<UserService>(UserService);
            this.drawerService = injector.get<DrawerService>(DrawerService);
        })
    }

    insert(device: IDevice): Promise<any>{
        return this.socket.emitPromise('create', {device});
    }

    getByStoreId(storeId: string): Observable<IDevice[]> {
        let subject = new Subject<IDevice[]>();

        this.socket.emitPromise('getByStoreId', {storeId})
            .then(ids => {
                if(ids.length) {
                    Observable.combineLatest(ids.map(id => this.getAssociated(id)))
                        .subscribe(subject);
                }
                else {
                    subject.next([]);
                }
            });

        return subject.asObservable();
    }

    isRegistered(deviceId: string): Promise<boolean>{
        return this.socket.emitPromise('isRegistered', deviceId);
    }

    newInstance(): IDevice {
        return new Device({
            id: uuid.v4(),
            version: 0,
            storeId: '',
            name: ''
        })
    }

    dbInstance(fromDb: IDevice) {
        return new Device(fromDb);
    }

    instanceForSocket(object: IDevice) {
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,
            name: object.name
        }
    }

    register() {
        this.router.navigate(['auth', 'register-device'])
    }

    resolveAssociations(device: IDevice): ObjectObservable<IDevice> {
        let obs = Observable.combineLatest(
            this.drawerService.getCurrent(false, device.id)
        ).map(([currentDrawer]) => {
            device.CurrentDrawer = currentDrawer;

            return device;
        });


        return new ObjectObservable(obs, device.id);
    }
}
