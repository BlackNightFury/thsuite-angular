import {Component, Injector, OnInit} from "@angular/core";
import {flyInFromTop, flyInOutFromRight} from "../../../lib/animations/flyIn";
import {Observable} from "rxjs";
import {IProduct} from "../../../models/interfaces/product.interface";
import {ProductService} from "../../../services/product.service";
import {SupplierService} from "../../../services/supplier.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {AddEditViewProductComponent} from "./add-edit-view-product/add-edit-view-product.component";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {UserService} from "../../../services/user.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";


declare const $;

@Component({
    selector: 'app-products-index',
    templateUrl: './products-index.component.html',
    styleUrls: [ './products-index.component.css' ],

    animations: [
        flyInFromTop,
        flyInOutFromRight
    ],
})
export class ProductsIndexComponent extends ObjectsIndexComponent<IProduct> implements OnInit {

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    constructor(injector: Injector, private productService: ProductService, private supplierService: SupplierService, private productTypeService: ProductTypeService) {
        super(injector, productService);
    }

    ngOnInit() {
        super.ngOnInit();

        // Observable combineLatest then projection then subscribe extraFilters

        Observable.combineLatest(
            this.selectedSupplierIdSource,
            this.selectedProductTypeIdSource,
            (supplierId, productTypeId) => {
                return {
                    supplierId: supplierId,
                    productTypeId: productTypeId
                };
            }
        ).subscribe(this.extraFilters);

        Observable.combineLatest(
            CommonAdapter(this.supplierService, 'id', supplier => `<div class="flex-row"><div class="flex-col-50 align-left">${supplier.name}</div><div class="flex-col-50 align-right">${supplier.licenseNumber}</div>`),
            CommonAdapter(this.productTypeService, 'id', 'name')
        ).toPromise()
            .then(([SupplierAdapter, ProductTypeAdapter]) => {

                this.supplierSelect2Options = {
                    ajax: {},
                    placeholder: 'Supplier',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;
                this.supplierSelect2InitialValue = [];


                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];

            });
    }


    onRowClick(event, product: IProduct) {
        if($(event.target).is('i')) {
            return;
        }

        //Row click is always view now, regardless of permissions
        this.viewProduct(product);

        // if(this.user.Permissions.inventoryManagement == 'edit' && this.user.Permissions.canEditProducts) {
        //     this.editProduct(product)
        // }
        // else {
        //     this.viewProduct(product);
        // }
    }

    createNewProduct() {
        this.productService.create();
    }

    editProduct(product: IProduct) {
        this.productService.edit(product);
    }

    viewProduct(product: IProduct) {
        this.productService.view(product);
    }

    listProducts() {
        this.productService.list();
    }

    exportProducts() {
        this.productService.exportProducts( { supplierId: this.selectedSupplierId, productTypeId: this.selectedProductTypeId } ).then((url) => {
            var iframe = $("<iframe/>").attr({
                src: url.Location,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");
        })
    }

    private _selectedSupplierId: string;
    get selectedSupplierId() {
        return this._selectedSupplierId;
    }
    set selectedSupplierId(newValue: string) {
        this._selectedSupplierId = newValue;
        this.selectedSupplierIdSource.next(newValue);
    }

    private _selectedProductTypeId: string;
    get selectedProductTypeId() {
        return this._selectedProductTypeId;
    }
    set selectedProductTypeId(newValue: string) {
        this._selectedProductTypeId = newValue;
        this.selectedProductTypeIdSource.next(newValue);
    }
}
