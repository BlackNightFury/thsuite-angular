import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {Component, Injector, OnInit} from "@angular/core";
import {ICaregiver} from "../../../models/interfaces/caregiver.interface";
import {CaregiverService} from "../../../services/caregiver.service";
import {IUser} from "../../../models/interfaces/user.interface";
import {UserService} from "../../../services/user.service";
import {SortBy} from "../../../util/directives/sort-table-header.directive";

@Component({
    selector: 'app-caregivers-index',
    templateUrl: './caregivers-index.component.html'
})
export class CaregiversIndexComponent extends ObjectsIndexComponent<ICaregiver> implements OnInit{

    user: IUser;

    constructor(injector: Injector, private caregiverService: CaregiverService, userService: UserService){
        super(injector, caregiverService);

        this.userService.userEmitted.subscribe(user => {
            this.user = user;

            if (!this.user.Permissions.canAccessCaregiverDashboard) {
                this.caregiverService.backToDash();
            }
        });
    }

    ngOnInit(){
        this.sortByModel = new SortBy("lastName", "asc");
        super.ngOnInit();
    }

    onRowClick(event, caregiver: ICaregiver){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewCaregiver(caregiver);
    }

    createNewCaregiver() {
        this.caregiverService.create();
    }
    editCaregiver(caregiver: ICaregiver) {
        this.caregiverService.edit(caregiver);
    }
    viewCaregiver(caregiver: ICaregiver) {
        this.caregiverService.view(caregiver);
    }

    listCaregivers() {
        this.caregiverService.list()
    }

}
