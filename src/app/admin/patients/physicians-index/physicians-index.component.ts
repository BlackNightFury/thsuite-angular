import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {PhysicianService} from "../../../services/physician.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {IPhysician} from "../../../models/interfaces/physician.interface";
import {IUser} from "../../../models/interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import { SortBy } from "../../../util/directives/sort-table-header.directive";

declare const $;

@Component({
    selector: 'app-physician-index',
    templateUrl: './physicians-index.component.html',
})
export class PhysiciansComponent extends ObjectsIndexComponent<IPhysician> implements OnInit {

    user: IUser;

    constructor(injector: Injector, private physicianService: PhysicianService, userService: UserService) {
        super(injector, physicianService);

        this.userService.userEmitted.subscribe(user => {
            this.user = user;

            if (!this.user.Permissions.canAccessPhysiciansDashboard) {
                this.physicianService.backToDash();
            }
        });
    }

    ngOnInit() {
        this.sortByModel = new SortBy("lastName", "asc");
        super.ngOnInit();
    }

    onRowClick(event, physician: IPhysician) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewPhysician(physician);
    }

    createNewPhysician() {
        this.physicianService.create();
    }
    editPhysician(physician: IPhysician) {
        this.physicianService.edit(physician);
    }
    viewPhysician(physician: IPhysician) {
        this.physicianService.view(physician);
    }

    listPhysicians() {
        this.physicianService.list()
    }
}
