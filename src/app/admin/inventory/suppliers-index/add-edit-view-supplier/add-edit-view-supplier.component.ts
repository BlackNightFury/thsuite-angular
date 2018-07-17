import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {ISupplier} from "../../../../models/interfaces/supplier.interface";
import {SupplierService} from "../../../../services/supplier.service";
import {Supplier} from "../../../../models/supplier.model";
import {ActivatedRoute} from "@angular/router";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";

@Component({
    selector: 'app-add-edit-view-supplier',
    templateUrl: './add-edit-view-supplier.component.html'
})
export class AddEditViewSupplierComponent extends AddEditViewObjectComponent<ISupplier> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;


    supplierObservable: Observable<ISupplier>;

    errors: string[];

    errorFlags: {
        name: boolean;
        streetAddress: boolean;
        city: boolean;
        state: boolean;
        zip: boolean;
        phone: boolean;
    } = {
        name: false,
        streetAddress: false,
        city: false,
        state: false,
        zip: false,
        phone: false
    };

    constructor(injector: Injector, private supplierService: SupplierService) {
        super(injector, supplierService);
    }

    ngOnInit() {

        super.ngOnInit();

        this.supplierObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.supplierService.getAssociated(id) : Observable.of(this.supplierService.newInstance());
            });

        this.supplierObservable.subscribe(supplier => {

            if (this.object) {
                //TODO dirty check
            }

            this.object = new Supplier(supplier);
        })

    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.supplierService.edit(this.object);
    }

    save() {
        let errors = [];

        this.clearErrorFlags();

        if (!this.object.name) {
            errors.push('Name is a required field');
            this.errorFlags.name = true;
        }
        if (!this.object.streetAddress) {
            errors.push('Street Address is a required field.');
            this.errorFlags.streetAddress = true;
        }
        if (!this.object.city) {
            errors.push('City is a required field.');
            this.errorFlags.city = true;
        }
        if (!this.object.state) {
            errors.push('State is a required field.');
            this.errorFlags.state = true;
        }
        if (!this.object.zip) {
            errors.push('Zip Code is a required field');
            this.errorFlags.zip = true;
        }
        if (!this.object.phone) {
            errors.push('Phone Number is a required field');
            this.errorFlags.phone = true;
        }

        if (errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.supplierService.save(this.object);
    }

    cancel() {
        this.supplierService.cancelEdit(this.object);
    }

    formatPhoneNumber(event: any) {
        var numbers = event.target.value.replace(/\D/g,'');
        var output = numbers.replace(/^(\d{3})(\d{1})/, '($1) $2');
        output = output.replace(/^\((\d{3})\)\s(\d{3})(\d{1})/, '($1) $2-$3');
        event.target.value = output;
    }

}
