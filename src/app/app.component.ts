import {Component, OnInit} from "@angular/core";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {SocketService} from "./lib/socket";
import {UserService} from "./services/user.service";
import {Router} from "@angular/router";
import {ReloadService} from "./services/reload.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    mode: string = "pos";

    isSocketConnected : boolean;

    constructor(router: Router, loadingBarService: SlimLoadingBarService, socketService: SocketService, reloadService: ReloadService, private authService: UserService) {

        // Export router object to global window for backstopjs
        window['$router'] = router;

        //TODO not sure if this is the right place
        loadingBarService.interval = 10;

        if (sessionStorage !== undefined) {

            // Sync loginToken from other tabs
            if (!sessionStorage.loginToken) {
                localStorage.setItem('getLoginToken', (new Date().getTime()).toString());
            }

            $(window).on('storage', (evt: any) => {
                const name = evt.originalEvent.key;
                const val = evt.originalEvent.newValue;

                if (name == 'getLoginToken' && val && sessionStorage.loginToken) {
                    localStorage.removeItem('getLoginToken');
                    localStorage.setItem('setLoginToken', sessionStorage.loginToken);
                } else if (name == 'setLoginToken' && val) {
                    localStorage.removeItem('setLoginToken');
                    sessionStorage.setItem('loginToken', val);
                } else if (name == 'removeLoginTokenAndLogout' && val) {
                    sessionStorage.removeItem('loginToken');
                    localStorage.removeItem('removeLoginToken');

                    this.authService.doLogout();
                }
            });
        }
    }

    ngOnInit() {

    }
}
