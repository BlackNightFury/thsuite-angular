import {Component, Injector, Input, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {StoreService} from "../../../../services/store.service";
import {Store} from "../../../../models/store.model";
import {IStore} from "../../../../models/interfaces/store.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";

@Component({
    selector: 'app-edit-location',
    templateUrl: './add-edit-view-location.component.html'
})
export class AddEditViewLocationComponent extends AddEditViewObjectComponent<IStore> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    @Input('store') storeObservable: Observable<IStore>;

    errors: string[];

    errorFlags: {
        name: boolean;
        city: boolean;
        state: boolean;
        manager: boolean
    } = {
        name: false,
        city: false,
        state: false,
        manager: false
    };

    constructor(injector: Injector, private storeService: StoreService) {
        super(injector, storeService);
    }

    ngOnInit() {

        super.ngOnInit();

        this.storeObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.storeService.getAssociated(id) : Observable.of(this.storeService.newInstance());
            });

        this.storeObservable.subscribe(store => {

            if (this.object) {
                //TODO dirty check
            }

            this.object = new Store(store);
        })

    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.storeService.edit(this.object);
    }

    view() {
        this.storeService.view(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];

        if (!this.object.name) {
            errors.push('Name is a required field.');
            this.errorFlags.name = true;
        }
        if (!this.object.city) {
            errors.push('City is a required field.');
            this.errorFlags.city = true;
        }
        if (!this.object.state) {
            errors.push('State is a required field.');
            this.errorFlags.state = true;
        }
        if (!this.object.storeManager) {
            errors.push('Store Manager is a required field.');
            this.errorFlags.manager = true;
        }

        if (errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.storeService.save(this.object, true);
    }

    cancel() {
        this.storeService.cancelEdit(this.object);
    }

}
