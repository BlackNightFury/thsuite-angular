import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IProductType} from "../../../../models/interfaces/product-type.interface"
import {ProductType} from "../../../../models/product-type.model";
import {ProductTypeService} from "../../../../services/product-type.service";
import {ActivatedRoute} from "@angular/router";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";


@Component({
    selector: 'app-add-edit-view-product-type',
    templateUrl: './add-edit-view-product-type.component.html'
})
export class AddEditViewProductTypeComponent extends AddEditViewObjectComponent<IProductType> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    productTypeObservable: Observable<ProductType>;

    errors: string[];

    errorFlags: {
        name: boolean;
        unit: boolean;
    } = {
        name: false,
        unit: false
    };

    constructor(injector: Injector, private productTypeService: ProductTypeService) {
        super(injector, productTypeService);
    }

    ngOnInit() {

        super.ngOnInit();

        this.productTypeObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.productTypeService.getAssociated(id) : Observable.of(this.productTypeService.newInstance());
            });

        this.productTypeObservable.subscribe(productType => {

            if (this.object) {
                //TODO dirty check
            }

            this.object = new ProductType(productType);
        })

    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.productTypeService.edit(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];
        if (!this.object.name) {
            errors.push('Name is a required field.');
            this.errorFlags.name = true;
        }

        //Non Cannabis types automatically have unitOfMeasure set to Each
        this.object.unitOfMeasure = 'each';

        if(errors.length){
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.productTypeService.save(this.object);
    }

    async remove(){
        let errors = [];
        if(!(await this.productTypeService.canRemove(this.object))){
            errors.push("Cannot delete product types that are still associated with products.");
            this.errors = errors;
            return;
        }else{
            this.productTypeService.remove(this.object);
        }
    }

    cancel() {
        this.productTypeService.cancelEdit(this.object);
    }

}
