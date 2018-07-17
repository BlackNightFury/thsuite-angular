import {ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import { environment } from '../../../environments/environment';


@Injectable()
export class DebugAuthGuard implements CanActivate, CanLoad {

    constructor(private router: Router) {
    }

    private redirectToHome() {
        this.router.navigateByUrl('/admin/home')
    }

    private isEnvNotProd() {
        // For debug production should be explicitly set to false
        if (environment.production !== false) {
            this.redirectToHome();
            return false;
        }

        return true;
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

        return this.isEnvNotProd();
    }

    canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {

        return this.isEnvNotProd();
    }

}
