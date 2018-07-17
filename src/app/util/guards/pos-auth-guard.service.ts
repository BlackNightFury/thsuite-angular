import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {UserService} from "../../services/user.service";
import {DeviceService} from "../../services/device.service";


@Injectable()
export class PosAuthGuard implements CanActivate, CanLoad {

    constructor(private authService: UserService, private router: Router, private deviceService: DeviceService) {
    }

    private redirectToLogin() {
        this.router.navigateByUrl('/auth/login')
    }

    private redirectToRegister(){
        this.router.navigateByUrl('/auth/register-device');
    }

    private isUserPos() {

        return this.authService.getLoggedIn()
            .then(loggedIn => {

                if(!loggedIn) {
                    this.redirectToLogin();
                    return false;
                }

                return true;
            });
    }

    private isDeviceRegistered(){
        let deviceId = localStorage.getItem('deviceId');
        return this.deviceService.isRegistered(deviceId)
            .then(registered => {
                if(!registered){
                    this.redirectToRegister();
                    return false;
                }

                return true;
            })
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return new Promise(resolve => {
            let all = Promise.all([this.isUserPos(), this.isDeviceRegistered()]);
            all.then(([isPos, isRegistered]) => resolve(isPos && isRegistered));
        });
    }

    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {

        return new Promise(resolve => {
            let all = Promise.all([this.isUserPos(), this.isDeviceRegistered()]);
            all.then(([isPos, isRegistered]) => resolve(isPos && isRegistered));
        });
    }

}
