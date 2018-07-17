import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
})
export class EmployeesComponent implements OnInit, OnDestroy {

    mode: string = 'patients';

    isTokenModalShowing: boolean = false;
    tokenModalSubscription: Subscription;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private userService: UserService) {
    }

    ngOnInit() {
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

        this.tokenModalSubscription = this.userService.tokenModalShowingEmitted.subscribe(val => this.isTokenModalShowing = val);
    }

    ngOnDestroy(){
        this.tokenModalSubscription && this.tokenModalSubscription.unsubscribe();
    }

}
