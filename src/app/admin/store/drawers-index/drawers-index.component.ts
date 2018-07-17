import {Component, OnInit, Injector} from "@angular/core";

import {DeviceService} from "../../../services/device.service";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {StoreService} from "../../../services/store.service";
import {UserService} from "../../../services/user.service";

import {IDevice} from "../../../models/interfaces/device.interface";
import {IStore} from "../../../models/interfaces/store.interface";
import {IUser} from "../../../models/interfaces/user.interface";

@Component({
    selector: 'app-drawers-index',
    templateUrl: './drawers-index.component.html',
    styleUrls: ['./drawers-index.component.css']
})

export class DrawersIndexComponent implements OnInit {

    devices: IDevice[];

    filter: string;
    filters = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'In Use',
            value: 'in-use'
        }
    ];

    localDeviceId: string;

    store: IStore;

    user: IUser;

    savedIndicator: boolean = false;

    constructor(injector: Injector, private deviceService: DeviceService, private storeService: StoreService, private userService: UserService, private loadingBarService: SlimLoadingBarService){
        this.localDeviceId = localStorage.getItem('deviceId')
    }

    initializeLocalDevice() {
        this.deviceService.register()
    }

    ngOnInit(){

        this.loadingBarService.interval = 100;
        this.loadingBarService.start()

        this.userService.userEmitted.subscribe( user => this.user = user )

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.store = store
            this.deviceService.getByStoreId(store.id).subscribe( devices => {
                this.devices = devices
                this.loadingBarService.complete();
            } )

        } )
    }
}
