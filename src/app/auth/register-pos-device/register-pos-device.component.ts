import {DeviceService} from "../../services/device.service";
import {DrawerService} from "../../services/drawer.service";
import {StoreService} from "../../services/store.service";
import {UserService} from "../../services/user.service";
import {Component, OnInit} from "@angular/core";
import {IStore} from "../../models/interfaces/store.interface";
import {IUser} from "../../models/interfaces/user.interface";
import {Router} from "@angular/router";

@Component({
    selector: 'app-register-pos-device',
    templateUrl: './register-pos-device.component.html',
    styleUrls: [ './register-pos-device.component.css' ]
})
export class RegisterPosDeviceComponent implements OnInit{

    deviceName: string;

    errors: string[];

    store: IStore;

    user: IUser;
    router: Router;

    constructor(router: Router, private authService: UserService, private storeService: StoreService, private drawerService: DrawerService, private deviceService: DeviceService ){
        this.router = router;
        if( localStorage.getItem('deviceId') ){
            let deviceId = localStorage.getItem('deviceId');
            deviceService.isRegistered(deviceId)
                .then(registered => {
                    if(registered){
                        this.router.navigateByUrl('/pos/all');
                    }
                })
        }
    }

    ngOnInit(){
        this.authService.userEmitted.subscribe( user => this.user = user )

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.store = store
        } )
    }

    backToLogin(){
        this.authService.doLogout();
    }

    backToHome(){
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

            this.router.navigateByUrl('/pos/all');
        });

    }

    continueToHome(){
        this.router.navigateByUrl('/admin/home');
    }

}
