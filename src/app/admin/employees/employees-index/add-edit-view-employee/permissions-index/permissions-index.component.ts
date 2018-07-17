import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../../../models/interfaces/product.interface";
import {Observable} from "rxjs/Observable";
import {ProductService} from "../../../../../services/product.service";
import {Product} from "../../../../../models/product.model";
import {IProductVariation} from "../../../../../models/interfaces/product-variation.interface";
import {UserService} from "../../../../../services/user.service";
import {IUser} from "../../../../../models/interfaces/user.interface";
import {IPermission} from "../../../../../models/interfaces/permission.interface";
import {User} from "../../../../../models/user.model";
import {PermissionService} from "../../../../../services/permission.service";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {environment} from "../../../../../../environments/environment";

@Component({
    selector: 'app-permissions-index',
    templateUrl: './permissions-index.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class PermissionsIndexComponent implements OnInit {

    userObservable: Observable<IUser>;

    user: IUser;
    permissions: IPermission;
    environment: any = environment;

    constructor(private router: Router, private route: ActivatedRoute, private userService: UserService, private permissionService: PermissionService) {
      this.environment = environment;
    }

    ngOnInit() {

        this.userObservable = this.route.parent.params.map(params => params['id'])
            .switchMap((id: string) => {
                return this.userService.getAssociated(id);
            });


        this.userObservable.subscribe(user => {

            if (this.user) {
                //TODO dirty check
            }

            this.user = new User(user);

            // we need only a copy of permissions because upon cancel() this.user.Permissions object must be reverted.
            this.permissions = Object.assign({}, this.user.Permissions);

            // this.permissions.administrativeManagement exists only virtually for grouping some settings
            if (this.permissions.canPersistentLogin || this.permissions.canRegisterDevice) {
                this.permissions.administrativeManagement = 'edit';
            } else {
                this.permissions.administrativeManagement = 'none';
            }
        });
    }


    save() {
        if (this.permissions.administrativeManagement == 'none') {
            this.permissions.canPersistentLogin = false;
            this.permissions.canRegisterDevice = false;
        }

        this.permissionService.save(this.permissions, () => {
            this.userService.edit(this.user);
        });
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.userService.edit(this.user);
        }
    }
}
