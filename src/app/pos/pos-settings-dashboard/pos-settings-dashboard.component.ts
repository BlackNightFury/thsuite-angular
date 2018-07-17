import {Component, OnInit} from "@angular/core";
import {IUser} from "../../models/interfaces/user.interface";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-settings-dashboard',
    templateUrl: './pos-settings-dashboard.component.html'
})
export class PosSettingsDashboardComponent implements OnInit {

    user: IUser;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private userService: UserService
    ){
    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user;
            });
    }
}
