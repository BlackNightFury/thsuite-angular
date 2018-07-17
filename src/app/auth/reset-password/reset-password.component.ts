import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {IUser} from "app/models/interfaces/user.interface";
import {ɵStyleData} from "@angular/animations";

declare const $;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {

    user: IUser;

    errors: string[];
    password1: string;
    password2: string;

    match: boolean = true;

    constructor(private authService: UserService) {
    }

    ngOnInit() {

        this.authService.userEmitted.subscribe(user => {
            this.user = user;
        });

    }

    updatePassword(){
        //Validate the passwords match
        let errors = [];

        if (this.password1 && !this.password2){
            errors.push("Please confirm your password.");
            this.errors = errors;
            return;
        }

        if(!this.password1 || !this.password2){
            errors.push("Please enter your new password in both fields.");
            this.errors = errors;
            return;
        }

        if(this.password1 != this.password2){
            errors.push('Entered passwords must match.');
        }

        if(this.password1.length < 8){
            errors.push("Password must be at least 8 characters.");
        }

        if ( errors.length > 0 ) {
            this.errors=errors;
            return;
        }

        //If they match, update the password
        let successObservable = this.authService.updatePassword(this.user, this.password1);

        successObservable.subscribe(success => {
            if(success) this.backToLoginPage();
        });

    }

    backToLoginPage(){
        this.errors = undefined;
        this.password1 = undefined;
        this.password2 = undefined;

        // We don't want anyone signed in after password reset.
        // Could possibly occur if admin is signed in and new employee creates their password
        this.authService.doLogout();


        $.notify("Password updated successfully!", "success");

    }



}
