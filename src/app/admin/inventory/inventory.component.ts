import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {PackageService} from "../../services/package.service";

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {

    mode: string = 'products';
    isUploadIdsModalShowing:boolean;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
                private packageService: PackageService) {
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

        this.packageService.uploadIdsModalShowing.subscribe(val => {
            this.isUploadIdsModalShowing = val;
        });
    }
    
    hideLeftNav() {
        document.querySelector('.leftnav').classList.remove('show');
        document.querySelector('.left-sidebar').classList.remove('show');
    }
}
