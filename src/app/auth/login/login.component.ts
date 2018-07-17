import {environment} from "../../../environments/environment";
import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

    username: string;
    password: string;

    loggingInWithToken: boolean = false;

    error: string;

    constructor(private authService: UserService) {}

    ngOnInit() {
        if (sessionStorage !== undefined && sessionStorage.getItem) {
            const loginToken = sessionStorage.getItem('loginToken');

            if (loginToken) {
                this.loggingInWithToken = true;
                this.authService.doLoginWithToken(loginToken, true)
                    .then((err) => {
                        if (err) {
                            this.loggingInWithToken = false;
                            // failed to login with token so remove it
                            sessionStorage.removeItem('loginToken');
                        }
                    });
            }
        }
    }

    doLogin(isEnter?: boolean) {
        if( isEnter && (!this.password) ) return;

        this.authService.doLogin(this.username, this.password)
            .then(error => {
                console.log(error);
                if (error) this.error = error
            })
    }
}
