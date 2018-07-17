import {UserService} from "../../../services/user.service";
import {Component, OnInit} from "@angular/core";
import {didSet} from "../../../lib/decorators/property/didSet";
import {Router} from "@angular/router";
import {DeviceService} from "../../../services/device.service";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";
import {IUser} from "../../../models/interfaces/user.interface";
import {IDevice} from "../../../models/interfaces/device.interface";

@Component({
    selector: 'app-register-pos-device',
    templateUrl: './register-pos-device.component.html'
})
export class RegisterPosDeviceComponent implements OnInit{

    deviceName: string;
    router: Router;
    errors: string[];

    store: IStore;
    user: IUser;

    alreadyRegistered: boolean;
    registeredDevice: IDevice;

    constructor(router: Router, private userService: UserService, private storeService: StoreService, private deviceService: DeviceService){
        this.router = router;
    }

    ngOnInit(){

        this.storeService.currentStoreEmitted
            .subscribe(store => {
                this.store = store;
            });

        this.userService.userEmitted.subscribe(user => {
            this.user = user

            let deviceId = localStorage.getItem('deviceId');
            if(deviceId){
                this.deviceService.isRegistered(deviceId)
                    .then(isRegistered => {
                        this.alreadyRegistered = isRegistered;
                        if(isRegistered){
                            this.deviceService.get(deviceId)
                                .subscribe(device => {
                                    this.registeredDevice = device;
                                })
                        }
                    })
            }
        })
    }

    continueToHome(){
        this.router.navigateByUrl('/admin/home');
    }

    register(){
        let errors = [];
        if(!this.deviceName){
            errors.push("Device name cannot be blank");
        }

        if(errors.length){
            this.errors = errors;
            return;
        }

        let device = this.deviceService.newInstance();
        device.storeId = this.store.id;
        device.name = this.deviceName;
        this.deviceService.save(device, () => {
            localStorage.setItem('deviceId', device.id);

            this.router.navigateByUrl('/admin/home');
        });

    }
}

