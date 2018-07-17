import {Component, Injector, OnInit} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {IItem} from "../../../models/interfaces/item.interface";
import {ButtonTogglerComponent} from "../../../util/components/button-toggler/button-toggler.component";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import {ItemService} from "../../../services/item.service";
import {SupplierService} from "../../../services/supplier.service";
import {ProductTypeService} from "../../../services/product-type.service";
import {StoreSettingsService} from"../../../services/store-settings.service";
import {UserService} from "../../../services/user.service";

@Component({
    selector: 'app-items-index',
    templateUrl: './items-index.component.html',
    styleUrls: [ './items-index.component.css' ]
})
export class ItemsIndexComponent extends ObjectsIndexComponent<IItem> implements OnInit {

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];
    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    productTypeSelect2Options: Select2Options;
    productTypeSelect2InitialValue: string[] = [];
    selectedProductTypeIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    toggleStockOptions: Array<Object> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'In Stock',
            value: 'in'
        },
        {
            label: 'Out of Stock',
            value: 'out'
        }
    ];

    toggleStockSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    toggleMeasurementTypeOptions: Array<Object> = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'Weight',
            value: 'weight'
        },
        {
            label: 'Each',
            value: 'each'
        }
    ];

    toggleMeasurementSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    constructor(injector: Injector, private itemService: ItemService, private supplierService: SupplierService, private productTypeService: ProductTypeService) {
        super(injector, itemService);
    }

    ngOnInit() {
        super.ngOnInit();

        Observable.combineLatest(
            this.selectedSupplierIdSource,
            this.selectedProductTypeIdSource,
            this.toggleStockSource,
            this.toggleMeasurementSource,
            (supplierId, productTypeId, stock, measurementType) => {
                return {
                    supplierId: supplierId,
                    productTypeId: productTypeId,
                    stock: stock,
                    measurementType: measurementType
                };
            }
        ).subscribe(this.extraFilters);

        Observable.combineLatest(
            CommonAdapter(this.supplierService, 'id', supplier => `<div class="flex-row"><div class="flex-col-50 align-left">${supplier.name}</div><div class="flex-col-50 align-right">${supplier.licenseNumber}</div>`),
            CommonAdapter(this.productTypeService, 'id', 'name'),
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

    onRowClick(event, item) {
        if($(event.target).is('i')) {
            return;
        }

        console.log(item);

        this.viewItem(item);

        // if(this.user.Permissions.inventoryManagement == 'edit' && this.user.Permissions.canEditItems) {
        //     this.editItem(item)
        // }
        // else {
        //     this.viewItem(item);
        // }
    }

    createNewItem() {
        this.itemService.create();
    }

    editItem(item: IItem) {
        this.itemService.edit(item);
    }

    viewItem(item: IItem) {
        this.itemService.view(item);
    }

    listItems() {
        this.itemService.list()
    }

    exportItems() {
        this.itemService.exportItems( { supplierId: this.selectedSupplierId, productTypeId: this.selectedProductTypeId,
            stock: this.inStockOptions, measurementType: this.measurementType } ).then((url) => {
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

    private _inStockOptions: 'all'|'in'|'out' = 'all';

    set inStockOptions(value: 'all'|'in'|'out') {
        this._inStockOptions = value;
        this.toggleStockSource.next(value);
    }

    get inStockOptions() {
        return this._inStockOptions;
    }

    private _measurementType: 'all'|'each'|'weight' = 'all';

    set measurementType(value: 'all'|'each'|'weight') {
        this._measurementType = value;
        this.toggleMeasurementSource.next(value);
    }

    get measurementType() {
        return this._measurementType;
    }

}
