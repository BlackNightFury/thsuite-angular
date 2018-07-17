import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {ProductTypeService} from "../../services/product-type.service";
import {environment} from  "../../../environments/environment";

@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {

    mode: string = 'reports';

    sectionShowing: any = {
        sales: false,
        bestselling: false,
        discounts: false,
        transfers: false,
        inventory: false,
        taxes: false,
        timeClocks: false
    };

    environment;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private productType: ProductTypeService) {
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
                this.mode = event['mode'];
            });

        this.environment = environment;
    }

    toggleCollapsable(section){
        if(this.sectionShowing[section]){
            this.sectionShowing[section] = false;
        } else {
            Object.keys(this.sectionShowing).forEach(key => {
                this.sectionShowing[key] = false;
            });
            this.sectionShowing[section] = true;
        }
    }

    hideLeftNav() {
        document.querySelector('.leftnav').classList.remove('show');
        document.querySelector('.left-sidebar').classList.remove('show');
    }
}
