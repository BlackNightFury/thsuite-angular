import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {IItem} from "../../../../../models/interfaces/item.interface";
import {ItemService} from "app/services/item.service";
import {IProductVariation} from "../../../../../models/interfaces/product-variation.interface";
import {IPackage} from "../../../../../models/interfaces/package.interface";
import {PackageService} from "../../../../../services/package.service";
import {IUser} from "../../../../../models/interfaces/user.interface";
import {UserService} from "../../../../../services/user.service";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
    selector: 'app-packages-index',
    templateUrl: './packages-index.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class PackagesIndexComponent implements OnInit {


    showFinishedPackages: boolean = false;

    itemObservable: Observable<IItem>;

    item: IItem;

    user: IUser;

    get filteredPackages(): IPackage[] {
        if(this.showFinishedPackages) {
            return this.item.Packages
        }
        else {
            return this.item.Packages.filter(_package => !_package.FinishedDate)
        }
    }

    packages: IPackage[];

    constructor(private router: Router, private route: ActivatedRoute, private itemService: ItemService, private packageService: PackageService, private userService: UserService) {
    }

    ngOnInit() {

        this.userService.userEmitted
            .subscribe(user => {
                this.user = user
            });

        this.itemObservable = this.route.parent.params
            .map((params) => params['id'])
            .switchMap((id: string) => {
                return this.itemService.getAssociated(id);
            });

        this.itemObservable.subscribe(item => {

            if(this.item) {
                //TODO dirty check
            }

            this.item = item;
            this.packages = item.Packages;
            console.log(this.item);
        });

        this.itemService.refreshEmitted.subscribe(() => {

            this.itemObservable.take(1).subscribe(item => {
                this.item = item;
                this.packages = item.Packages;
                console.log("Refreshed item");
                console.log(item);
            })

        });
    }

    onRowClick(_package: IPackage) {
        if(this.user.Permissions.inventoryManagement == 'edit' && this.user.Permissions.canEditItems) {
            this.editPackage(_package);
        }
        else {
            this.viewPackage(_package);
        }
    }

    addPackage(){
        this.router.navigate(['add'], {relativeTo: this.route});
    }

    viewPackage(_package: IPackage){
        this.router.navigate(['view', _package.id], {relativeTo: this.route});
    }

    editPackage(_package: IPackage) {
        this.router.navigate(['edit', _package.id], {relativeTo: this.route});
    }


    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['..'], {relativeTo: this.route})
        }
    }
}
