import {ActivatedRouteSnapshot, CanActivate, Route, Router, RouterStateSnapshot} from "@angular/router";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {IDrawer} from "../../models/interfaces/drawer.interface";
import {DrawerService} from "../../services/drawer.service";


@Injectable()
export class PosListDrawerGuard implements CanActivate {

    private drawer: IDrawer;

    constructor(private drawerService: DrawerService, private router: Router) {
    }

    private redirectToDrawerManager() {
        this.drawerService.open(true)
    }

    private isDrawerStarted() {
        return new Promise( (resolve,reject) => {
            this.drawerService.getCurrent(false, localStorage.getItem('deviceId')).take(1).subscribe( drawer => {
                if( !drawer || !drawer.startingAmount || drawer.startingAmount <= 0 ) {
                    this.redirectToDrawerManager()
                    return resolve(false)
                }

                return resolve(true)
            } )
        } )
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.isDrawerStarted();
    }

}
