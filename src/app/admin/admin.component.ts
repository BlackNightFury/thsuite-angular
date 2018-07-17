import {Component, OnInit} from "@angular/core";
import { PreviousRouteService } from "../services/previous-route.service";
import { UserService } from "../services/user.service";
import { IUser } from "../models/interfaces/user.interface";
import { Router } from "@angular/router";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

    displayPOSNav: boolean;

    constructor(private router: Router, private previousRouteService: PreviousRouteService) {
    }

    ngOnInit() {
        if (this.router.url === "/admin/home/register-pos") {
            this.displayPOSNav = false;
        } else {
            if ((this.router.url === '/admin/account' &&
                this.previousRouteService.previousUrlContains('pos')) ||
                this.router.url.indexOf('pos') >= 0) {
                this.displayPOSNav = true;
            } else {
                this.displayPOSNav = false;
            }
        }
    }

    adminMenuClicked() {
        this.displayPOSNav = false;
    }

}
