import {Component, Injector, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {ProductTypeService} from "../../../services/product-type.service";
import {IProductType} from "../../../models/interfaces/product-type.interface";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";

declare const $;

@Component({
    selector: 'app-product-types-index',
    templateUrl: './product-types-index.component.html'
})
export class ProductTypesIndexComponent extends ObjectsIndexComponent<IProductType> implements OnInit {

    productTypes: Observable<IProductType[]>;

    constructor(injector: Injector, private productTypeService: ProductTypeService) {
        super(injector, productTypeService);
    }

    ngOnInit() {
        super.ngOnInit();

    }

    onRowClick(event, productType: IProductType){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewProductType(productType);

        // if (this.user.Permissions.inventoryManagement == 'edit' && this.user.Permissions.canEditProductTypes && productType.category != 'cannabis'){
        //     this.editProductType(productType);
        // }
        // else {
        //     this.viewProductType(productType);
        // }
    }

    createNewProductType() {
        this.productTypeService.create();
    }
    editProductType(productType: IProductType) {
        this.productTypeService.edit(productType);
    }
    viewProductType(productType: IProductType) {
        this.productTypeService.view(productType);
    }
    listProductTypes() {
        this.productTypeService.list()
    }

    exportProductTypes() {
        this.productTypeService.exportProductTypes().then((url) => {
            var iframe = $("<iframe/>").attr({
                src: url.Location,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");
        })
    }
}
