import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {User} from "../../models/user.model";
import {AlertService} from "../../services/alert.service";

@Component({
    selector: 'app-top-nav',
    templateUrl: 'top-nav.component.html'
})
export class TopNavComponent implements OnInit {
    sectionTitle: string;

    user: User;

    alertCount: number;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private authService: UserService,
                private alertService: AlertService) {
    }

    ngOnInit() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .map(() => this.activatedRoute)
            .map(route => {
                while (route.firstChild && !route.data['value']['sectionTitle']) route = route.firstChild;
                return route;
            })
            .filter(route => route.outlet === 'primary')
            .mergeMap(route => route.data)
            .subscribe((event) => {
                this.sectionTitle = event['sectionTitle'];
            });

        this.authService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.alertService.alertCountEmitted.subscribe(alertCount => this.alertCount = alertCount);
    }

    logout() {
        this.authService.doLogout()
    }

    toggleMenu() {
        var target = document.querySelector('[data-dropdown-target="userMenu"]');
        target.classList.toggle('show');
    }

    toggleLeftNav() {
        var target = document.querySelector('.leftnav');
        var target_status = target.classList.toggle('show');

        var target2 = document.querySelector('.left-sidebar');
        if (target2) {
            if (target_status === true) {
                target2.classList.add('show');
            } else {
                target2.classList.remove('show');
            }
        }
    }
}
