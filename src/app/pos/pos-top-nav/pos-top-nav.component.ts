import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Router} from "@angular/router";
import {PosCartService} from "../../services/pos-cart.service";
import {UserService} from "../../services/user.service";
import {IUser} from "../../models/interfaces/user.interface";
import { PreviousRouteService } from "../../services/previous-route.service";

@Component({
    selector: 'app-pos-top-nav',
    templateUrl: './pos-top-nav.component.html'
})
export class PosTopNavComponent implements OnInit {

    @Output() onShowNav = new EventEmitter<void>();
    @Input() isNavShowing: boolean;

    cartSize: number = 0;
    user: IUser;
    comesFromPOS: boolean;

    constructor(private router: Router,
        private cartService: PosCartService,
        private authService: UserService,
        private previousRouteService: PreviousRouteService) {
    }

    ngOnInit() {

        this.cartService.currentCartEmitted.subscribe(productsWithCounts => {

            let totalCount = 0;

            productsWithCounts.lineItems.forEach(({quantity}) => {
                totalCount += quantity;
            });

            this.cartSize = totalCount;
        });

        this.authService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.comesFromPOS = this.previousRouteService.previousUrlContains("pos/");
    }

    gotoSettings() {
        this.router.navigate(['pos', 'settings', 'receipts'])
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
