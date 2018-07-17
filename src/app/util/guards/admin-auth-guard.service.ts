import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {UserService} from "../../services/user.service";

@Injectable()
export class AdminAuthGuard implements CanActivate, CanLoad {

    constructor(private authService: UserService, private router: Router) {
    }

    private redirectToLogin() {
        this.router.navigateByUrl('/auth/login')
    }

    private isUserAdmin() {
        return this.authService.getLoggedIn()
            .then(loggedIn => {

                if(!loggedIn) {
                    this.redirectToLogin();
                    return false;
                }

                return new Promise(resolve => {
                    this.authService.userEmitted.take(1).subscribe(user => {

                        if(user.Permissions.patientManagement != 'none') {
                            return resolve(true);
                        }

                        if(user.Permissions.inventoryManagement != 'none') {
                            return resolve(true);
                        }

                        if(user.Permissions.storeManagement != 'none') {
                            return resolve(true);
                        }

                        if(user.Permissions.reportsManagement != 'none') {
                            return resolve(true);
                        }

                        if(user.Permissions.employeeManagement != 'none') {
                            return resolve(true);
                        }

                        this.redirectToLogin();
                        return resolve(false)
                    });
                });
            })
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return this.isUserAdmin();
    }

    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {

        return this.isUserAdmin();
    }

}
