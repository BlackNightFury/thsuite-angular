import {Component, Injector, OnInit} from "@angular/core";
import {DiscountService} from "../../../services/discount.service";
import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from  "../../../services/product-type.service";
import {PackageService} from "../../../services/package.service";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {IDiscount} from "../../../models/interfaces/discount.interface";
import {Discount} from "../../../models/discount.model";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";


declare const $;

@Component({
    selector: 'app-discounts-index',
    templateUrl: 'discounts-index.component.html',
})
export class DiscountsIndexComponent extends ObjectsIndexComponent<IDiscount> implements OnInit {

    selectedDiscountEntitySource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    discountEntitySelect2Options: Select2Options;

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productSelect2Options: Select2Options;
    productSelect2InitialValue: string[] = [];
    selectedProductIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    packageSelect2Options: Select2Options;
    packageSelect2InitialValue: string[] = [];
    selectedPackageIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    // flags to show select dropdowns
    flags: any = {
        productId: false,
        productTypeId: false,
        packageId: false
    };

    toggleStatusOptions: Array<any> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'Active',
            value: 'on'
        },
        {
            label: 'Inactive',
            value: 'off'
        }
    ];

    toggleStatusSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    constructor(injector: Injector, private discountService: DiscountService, private productService: ProductService, private productTypeService: ProductTypeService, private packageService: PackageService) {
        super(injector, discountService);
    }

    ngOnInit() {
        super.ngOnInit();

        Observable.combineLatest(
            this.selectedDiscountEntitySource,
            this.selectedProductIdSource,
            this.selectedProductTypeIdSource,
            this.selectedPackageIdSource,
            this.toggleStatusSource,
            (discountEntity, productId, productTypeId, packageId, status) => {
                return {
                    discountEntity: discountEntity,
                    productId: productId,
                    productTypeId: productTypeId,
                    packageId: packageId,
                    status: status
                };
            }
        ).subscribe(this.extraFilters);

        this.discountEntitySelect2Options = {
            placeholder: 'Discount Entity',
            allowClear: true,
            data: [
                {
                    id: 'none',
                    text: 'No Entity'
                },
                {
                    id: 'productId',
                    text: 'Product'
                },
                {
                    id: 'productTypeId',
                    text: 'Product Type'
                },
                {
                    id: 'packageId',
                    text: 'Package'
                }
            ]
        };

        Observable.combineLatest(
            CommonAdapter(this.productService, 'id', 'name'),
            CommonAdapter(this.productTypeService, 'id', 'name'),
            CommonAdapter(this.packageService, 'id', 'Label')
        ).toPromise()
            .then(([ProductAdapter, ProductTypeAdapter, PackageAdapter]) => {

                this.productSelect2Options = {
                    ajax: {},
                    placeholder: 'Product',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productSelect2Options['dataAdapter'] = ProductAdapter;
                this.productSelect2InitialValue = [];


                this.productTypeSelect2Options = {
                    ajax: {},
                    placeholder: 'Product Type',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                this.productTypeSelect2InitialValue = [];


                this.packageSelect2Options = {
                    ajax: {},
                    placeholder: 'Package',
                    allowClear: true,
                    dropdownCssClass: 'compact'
                };
                this.packageSelect2Options['dataAdapter'] = PackageAdapter;
                this.packageSelect2InitialValue = [];
            });

    }

    onRowClick(event, discount: IDiscount) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewDiscount(discount);

        // if (this.user.Permissions.storeManagement == 'edit' && this.user.Permissions.canEditDiscounts){
        //     this.editDiscount(discount);
        // }
        // else{
        //     this.viewDiscount(discount);
        // }
    }

    toggleActive(discount: IDiscount, isChecked: boolean) {
        let newDiscount = new Discount(discount);
        newDiscount.isActive = isChecked;

        this.discountService.save(newDiscount);
    }

    createNewDiscount() {
        this.discountService.create();
    }
    editDiscount(discount: IDiscount) {
        this.discountService.edit(discount);
    }
    viewDiscount(discount: IDiscount) {
        this.discountService.view(discount);
    }

    listDiscounts() {
        this.discountService.list()
    }

    unsetAll() {
        this.selectedProduct = undefined;
        this.selectedProductType = undefined;
        this.selectedPackage = undefined;
    }

    private _selectedDiscountEntity: string;
    get selectedDiscountEntity() {
        return this._selectedDiscountEntity;
    }
    set selectedDiscountEntity(newValue: string) {
        // Need to unset other filters when discount entity filter is cleared
        if (newValue == '') {
            this.unsetAll();
        }
        this._selectedDiscountEntity = newValue;
        // Update which dropdown is shown
        Object.keys(this.flags).forEach(key => {
            this.flags[key] = (key == newValue);
        });
        this.selectedDiscountEntitySource.next(newValue);
    }

    private _selectedProduct: string;
    get selectedProduct() {
        return this._selectedProduct;
    }
    set selectedProduct(newValue: string) {
        this._selectedProduct = newValue;
        this.selectedProductIdSource.next(newValue);
    }

    private _selectedProductType: string;
    get selectedProductType() {
        return this._selectedProductType;
    }
    set selectedProductType(newValue: string) {
        this._selectedProductType = newValue;
        this.selectedProductTypeIdSource.next(newValue);
    }

    private _selectedPackage: string;
    get selectedPackage() {
        return this._selectedPackage;
    }
    set selectedPackage(newValue: string) {
        this._selectedPackage = newValue;
        this.selectedPackageIdSource.next(newValue);
    }

    private _statusOptions: 'all'|'on'|'off' = 'all';

    set statusOptions(value: 'all'|'on'|'off') {
        this._statusOptions = value;
        this.toggleStatusSource.next(value);
    }

    get statusOptions() {
        return this._statusOptions;
    }
}
