import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";

@Component({
    selector: 'app-left-nav',
    templateUrl: 'left-nav.component.html'
})
export class LeftNavComponent implements OnInit {

    user: IUser;

    constructor(private authService: UserService) {
    }

    ngOnInit() {
        this.authService.userEmitted.subscribe(user => {
            this.user = user;
        });
    }

    hideLeftNav() {
        const leftnav = document.querySelector('.leftnav');
        if(leftnav){
            leftnav.classList.remove('show');
        }

        const leftSidebar = document.querySelector('.left-sidebar');
        if(leftSidebar){
            leftSidebar.classList.remove('show');
        }
    }
}
