import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {IStore} from "../../models/interfaces/store.interface";
import {StoreService} from "../../services/store.service";
import {IUser} from "../../models/interfaces/user.interface";
import { UserService } from "../../services/user.service";

@Component({
    selector: 'app-store',
    templateUrl: 'store.component.html',
})
export class StoreComponent implements OnInit {

    user: IUser;

    mode: string = 'stores';
    storeForEdit: IStore;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private store: StoreService,
                private userService: UserService
            ) {
    }

    ngOnInit() {

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild) route = route.firstChild;
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {

                console.log(event['mode']);

                this.mode = event['mode'];
            });
    }
    
    hideLeftNav() {
        document.querySelector('.leftnav').classList.remove('show');
        document.querySelector('.left-sidebar').classList.remove('show');
    }
}
