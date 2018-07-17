import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";

declare const $;

@Component({
    selector: 'app-locations-index',
    templateUrl: './locations-index.component.html'
})
export class LocationsIndexComponent extends ObjectsIndexComponent<IStore> implements OnInit {


    constructor(injector: Injector, private storeService: StoreService) {
        super(injector, storeService)
    }

    ngOnInit() {
        super.ngOnInit();

    }

    onRowClick(event, store: IStore) {
        if($(event.target).is('i')) {
            return;
        }

        this.viewLocation(store);

        //
        // if(this.user.Permissions.storeManagement == 'edit' && this.user.Permissions.canEditStores) {
        //     this.editLocation(store);
        // }
        // else {
        //     this.viewLocation(store);
        // }
    }

    createNewLocation(){
        this.storeService.create();
    }

    viewLocation(store: IStore) {
        this.storeService.view(store);
    }

    editLocation(store: IStore) {
        this.storeService.edit(store);
    }

    listLocations() {
        this.storeService.list();
    }
}
