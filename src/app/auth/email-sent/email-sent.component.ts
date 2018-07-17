import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-email-sent',
    templateUrl: './email-sent.component.html',
})
export class EmailSentComponent implements OnInit {


    constructor(private authService: UserService) {
    }

    ngOnInit() {

    }


    backToSignIn(){
        this.authService.backToLogin();
    }



}
