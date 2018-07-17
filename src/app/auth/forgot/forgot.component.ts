import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: [ './forgot.component.css' ]
})
export class ForgotComponent implements OnInit {

    email: string;
    error: string = '';

    constructor(private authService: UserService) {
    }

    ngOnInit() {
    }

    sendResetEmail(){

        //Validate
        if(!this.email){
            this.error = 'You must enter an email address'
            return;
        }

        this.authService.sendResetEmail(this.email)
        .then( e => {
            if(e) this.error = e
        } )

    }

}
