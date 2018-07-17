import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";

@Component({
    selector: 'app-pos-list-left-nav',
    templateUrl: './pos-list-left-nav.component.html',
})
export class PosListLeftNavComponent implements OnInit {

    @Output() onHideNav = new EventEmitter<void>();

    public user: IUser;

    constructor(private userService: UserService) {
    }

    ngOnInit() {
        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        })


    }
}
