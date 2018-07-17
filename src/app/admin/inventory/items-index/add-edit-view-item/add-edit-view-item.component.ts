import {Component, Injector, OnInit, ViewChild, ElementRef} from "@angular/core";
import {IItem} from "../../../../models/interfaces/item.interface";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, Router} from "@angular/router";
import {ItemService} from "../../../../services/item.service";
import {ProductTypeService} from "../../../../services/product-type.service";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {UserService} from "../../../../services/user.service";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
    selector: 'app-add-edit-view-item',
    templateUrl: './add-edit-view-item.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewItemComponent extends AddEditViewObjectComponent<IItem> implements OnInit {
    @ViewChild('root')overlayRoot: ElementRef;

    errorFlags: {
        name: boolean;
        productType: boolean;
        initPackage: boolean;
    } = {
        name: false,
        productType: false,
        initPackage: false
    };

    get packagesShowing() {
        return !!this.route.firstChild;
    }

    //kinda hacky but these need to be set before discount for select2 initialization
    productTypeSelect2Options : Select2Options;

    errors: string[];

    constructor(injector: Injector, private itemService: ItemService, private productTypeService: ProductTypeService) {
        super(injector, itemService);
    }

    ngOnInit() {
        super.ngOnInit();

        CommonAdapter(this.productTypeService, 'id', 'name', {cannabisCategory: 'NonCannabis'})
            .then(ProductTypeAdapter => {

                this.productTypeSelect2Options = {
                    ajax: {}
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
            });
    }

    togglePackages() {
        if(!this.packagesShowing) {
            this.router.navigate(['packages'], {relativeTo: this.route});
        }
        else {
            this.router.navigate(['..'], {relativeTo: this.route.firstChild});
        }
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        console.log(this.object);
        this.itemService.edit(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];
        if(!this.object.name) {
            errors.push("Name is a required field.");
            this.errorFlags.name = true;
        }
        if(!this.object.productTypeId) {
            errors.push("Product Type is a required field.");
            this.errorFlags.productType = true;
        }

        if(this.mode == 'add'){
            if(!this.object.initialPackageQuantity){
                errors.push("Initial Package Quantity cannot be 0 or blank");
                this.errorFlags.initPackage = true;
            }
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }


        this.itemService.save(this.object);
        this.startLeaving();
    }

    remove(){
        //Confirm one more time
        if(this.object.ProductType.category != 'non-cannabis'){
            return;
        }else{
            this.itemService.remove(this.object);
        }
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.itemService.cancelEdit(this.object);
        }
    }
}
