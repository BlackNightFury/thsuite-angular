import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";

@Component({
    selector: 'app-pos-settings-dashboard-left-nav',
    templateUrl: './pos-settings-dashboard-left-nav.component.html',
})
export class PosSettingsDashboardLeftNavComponent implements OnInit {

    @Output() adminMenuClick: EventEmitter<any> = new EventEmitter();
    public user: IUser;
    public canAccessAdmin: boolean;

    constructor(private userService: UserService) {
    }

    ngOnInit() {
        this.userService.userEmitted.subscribe(user => {
            this.user = user;
            this.canAccessAdmin = this.userService.canUserAccessAdmin(this.user);
        });
    }

    logout(){
        this.userService.doLogout();
    }

    adminMenuClicked() {
        this.adminMenuClick.emit(null);
    }
}
