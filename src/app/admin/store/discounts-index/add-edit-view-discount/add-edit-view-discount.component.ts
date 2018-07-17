import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IDiscount} from "../../../../models/interfaces/discount.interface";
import {DiscountService} from "../../../../services/discount.service";
import {Discount} from "../../../../models/discount.model";
import {ProductTypeService} from "../../../../services/product-type.service";
import {IProductType} from "../../../../models/interfaces/product-type.interface";
import {ActivatedRoute} from "@angular/router";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PackageService} from "../../../../services/package.service";
import {ProductService} from "../../../../services/product.service";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {PatientGroupService} from "../../../../services/patient-group.service";
import {SupplierService} from "../../../../services/supplier.service";

@Component({
    selector: 'app-add-edit-view-discount',
    templateUrl: './add-edit-view-discount.component.html'
})
export class AddEditViewDiscountComponent extends AddEditViewObjectComponent<IDiscount> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    private _entityDiscountMode: 'product'|'productType'|'package'|'supplier'|undefined = undefined;
    set entityDiscountMode(value: 'product'|'productType'|'package'|'supplier') {
        let oldValue = this._entityDiscountMode;
        this._entityDiscountMode = value;

        if(!this.object || value == oldValue) {
            return;
        }

        if(value == 'product') {
            this.object.packageId = undefined;
            this.packageSelect2InitialValue = [];

            this.object.productTypeId = undefined;
            this.productTypeSelect2InitialValue = [];

            this.object.supplierId = undefined;
            this.supplierSelect2InitialValue = [];
        }
        else if(value == 'productType') {
            this.object.productId = undefined;
            this.productSelect2InitialValue = [];

            this.object.packageId = undefined;
            this.packageSelect2InitialValue = [];

            this.object.supplierId = undefined;
            this.supplierSelect2InitialValue = [];
        }
        else if(value == 'package') {
            this.object.productId = undefined;
            this.productSelect2InitialValue = [];

            this.object.productTypeId = undefined;
            this.productTypeSelect2InitialValue = [];

            this.object.supplierId = undefined;
            this.supplierSelect2InitialValue = [];
        }else if(value == 'supplier'){
            this.object.productId = undefined;
            this.productSelect2InitialValue = [];

            this.object.productTypeId = undefined;
            this.productTypeSelect2InitialValue = [];

            this.object.packageId = undefined;
            this.packageSelect2InitialValue = [];
        }
    }
    get entityDiscountMode() {
        return this._entityDiscountMode;
    }


    private _hasDateRequirement = false;
    set hasDateRequirement(value: boolean) {
        this._hasDateRequirement = value;
    }
    get hasDateRequirement(): boolean {
        return this._hasDateRequirement;
    }

    private _isAutomatic = true;
    set isAutomatic(value: boolean) {
        this._isAutomatic = value;

        if(this.object) {
            this.object.isAutomatic = value;
        }
    }
    get isAutomatic(): boolean {
        return this._isAutomatic;
    }

    private _managerApproval = false;
    set managerApproval(value: boolean){
        this._managerApproval = value;
        if(this.object){
            this.object.managerApproval = value;
        }
    }
    get managerApproval(): boolean{
        return this._managerApproval;
    }


    private _hasTimeRequirement = false;
    set hasTimeRequirement(value: boolean) {
        this._hasTimeRequirement = value;
    }
    get hasTimeRequirement() {
        return this._hasTimeRequirement
    }

    private _hasDaysOfWeekRequirement = false;
    set hasDaysOfWeekRequirement(value: boolean) {
        this._hasDaysOfWeekRequirement = value;
    }
    get hasDaysOfWeekRequirement() {
        return this._hasDaysOfWeekRequirement
    }

    //kinda hacky but these need to be set before discount for select2 initialization
    productTypeSelect2Options : Select2Options;
    productTypeSelect2InitialValue: string[] = [];

    productSelect2Options : Select2Options;
    productSelect2InitialValue: string[] = [];

    packageSelect2Options : Select2Options;
    packageSelect2InitialValue: string[] = [];

    patientGroupSelect2Options : Select2Options;
    patientGroupSelect2InitialValue: string[] = [];

    supplierSelect2Options: Select2Options;
    supplierSelect2InitialValue: string[] = [];


    discountObservable: Observable<IDiscount>;

    patientTypeOptions = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'Medical',
            value: 'medical'
        },
        {
            label: 'Recreational',
            value: 'recreational'
        }
    ];

    thcTypeOptions = [
        {
            label: 'All',
            value: 'all'
        },
        {
            label: 'THC',
            value: 'thc'
        },
        {
            label: 'Non THC',
            value: 'non-thc'
        }
    ];

    amountTypeOptions = [
        {
            label: '%',
            value: 'percent'
        },
        {
            label: '$',
            value: 'dollar'
        }
    ];
    minimumTypeOptions = [
        {
            label: 'Items',
            value: 'items'
        },
        {
            label: '$',
            value: 'price'
        }
    ];
    dayOptions = [
        {
            label: 'Sun',
            value: 'sun'
        },
        {
            label: 'Mon',
            value: 'mon'
        },
        {
            label: 'Tue',
            value: 'tue'
        },
        {
            label: 'Wed',
            value: 'wed'
        },
        {
            label: 'Thu',
            value: 'thu'
        },
        {
            label: 'Fri',
            value: 'fri'
        },
        {
            label: 'Sat',
            value: 'sat'
        }
    ];
    entityDiscountModeOptions = [
        {
            label: 'Product Type',
            value: 'productType'
        },
        {
            label: 'Product',
            value: 'product'
        },
        {
            label: 'Package',
            value: 'package'
        },
        {
            label: 'Supplier',
            value: 'supplier'
        }
    ];

    // discount: IDiscount;

    productTypes: Observable<IProductType>[];

    errors: string[];

    errorFlags: {
        name: boolean;
        date: boolean;
        time: boolean;
        amount: boolean;
        percent: boolean;
    } = {
        name: false,
        date: false,
        time: false,
        amount: false,
        percent: false
    };


    get stringDescription(): string {

        let output = '';
        output += 'Customers must ';

        if(this.object.minimumType == 'price') {
            output += `spend at least $${this.object.minimum} `;
        }
        else {
            output += `purchase at least ${this.object.minimum} ${this.object.minimum == 1 ? 'item' : 'items'} `;
        }

        output += 'to receive ';

        if(this.object.amountType == 'percent') {
            output += `${this.object.amount}% `;
        }
        else {
            output += `$${this.object.amount} `;
        }

        output += 'off each item';

        if(this.object.maximum){
            output += ' up to a total of $' + this.object.maximum + " off";
        }

        return output;
    }


    constructor(
        injector: Injector,
        private discountService: DiscountService,
        private productTypeService: ProductTypeService,
        private productService: ProductService,
        private packageService: PackageService,
        private patientGroupService: PatientGroupService,
        private supplierService: SupplierService
    ) {
        super(injector, discountService);
    }

    ngOnInit() {

        super.ngOnInit();

        this.discountObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                return id ? this.discountService.getAssociated(id) : Observable.of(this.discountService.newInstance());
            });

        this.discountObservable.subscribe(discount => {

            if (this.object) {
                //TODO dirty check
            }

            Observable.combineLatest(
                CommonAdapter(this.productTypeService, 'id', 'name'),
                CommonAdapter(this.productService, 'id', 'name'),
                CommonAdapter(this.packageService, 'id', 'Label'),
                CommonAdapter(this.patientGroupService, 'id', 'name'),
                CommonAdapter(this.supplierService, 'id', 'name')
            ).toPromise()
                .then(([ProductTypeAdapter, ProductAdapter, PackageAdapter, PatientGroupAdapter, SupplierAdapter]) => {

                    this.productTypeSelect2Options = {
                        ajax: {},
                        placeholder: 'Scan Barcode or Select'
                    };
                    this.productTypeSelect2Options['dataAdapter'] = ProductTypeAdapter;
                    this.productTypeSelect2InitialValue = [discount.productTypeId];

                    this.productSelect2Options = {
                        ajax: {},
                        placeholder: 'Scan Barcode or Select'
                    };
                    this.productSelect2Options['dataAdapter'] = ProductAdapter;
                    this.productSelect2InitialValue = [discount.productId];

                    this.packageSelect2Options = {
                        ajax: {},
                        placeholder: 'Scan Barcode or Select'
                    };
                    this.packageSelect2Options['dataAdapter'] = PackageAdapter;
                    this.packageSelect2InitialValue = [discount.packageId];

                    this.patientGroupSelect2Options = {
                        ajax: {},
                        allowClear: true,
                        placeholder: 'Select Patient Group'
                    };
                    this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;
                    this.patientGroupSelect2InitialValue = [discount.patientGroupId];

                    this.supplierSelect2Options = {
                        ajax: {},
                        placeholder: 'Select Supplier'
                    };
                    this.supplierSelect2Options['dataAdapter'] = SupplierAdapter;
                    this.supplierSelect2InitialValue = [discount.supplierId];

                    if(discount.productId) {
                        this.entityDiscountMode = 'product';
                    }
                    else if(discount.productTypeId) {
                        this.entityDiscountMode = 'productType';
                    }
                    else if(discount.packageId) {
                        this.entityDiscountMode = 'package';
                    }else if(discount.supplierId){
                        this.entityDiscountMode = 'supplier';
                    }


                    this.isAutomatic = discount.isAutomatic;
                    this.hasDateRequirement = !!discount.startDate;
                    this.hasTimeRequirement = !!discount.startTime;


                    this.object = new Discount(discount);
                });


        });

        this.productTypeService.all().subscribe(productTypes => {
            this.productTypes = productTypes;
        });
    }


    selectedProductTypeChanged(e) {
        this.object.productTypeId = e.value;
    }

    selectedProductChanged(e) {
        this.object.productId = e.value;
    }

    selectedPackageChanged(e) {
        this.object.packageId = e.value;
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.discountService.edit(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];
        if(!this.object.name) {
            errors.push("Name is a required field.");
            this.errorFlags.name = true;
        }
        if(!!this.object.startDate != !!this.object.endDate) {
            errors.push("If either Start Date or End Date are set the other must be too.")
            this.errorFlags.date = true;
        }
        if(!!this.object.startTime != !!this.object.endTime) {
            errors.push("If either Start Time or End Time are set the other must be too.")
            this.errorFlags.time = true;
        }
        if(this.object.amount == 0) {
            errors.push("Discount amount cannot be 0.")
            this.errorFlags.amount = true;
        }
        else if(this.object.amountType == 'percent' && this.object.amount > 100) {
            errors.push("Percent discount cannot be greater than 100.");
            this.errorFlags.percent = true;
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        //TODO If is automagic set object.code == undefined, THEN DATE, TIME and DOW
        if(this.isAutomatic){
            this.object.code = undefined;
        }
        if(!this.hasDateRequirement){
            this.object.startDate = undefined;
            this.object.endDate = undefined;
        }
        if(!this.hasTimeRequirement){
            this.object.startTime = undefined;
            this.object.endTime = undefined;
        }
        if(!this.hasDaysOfWeekRequirement){
            this.object.days = [];
        }

        this.discountService.save(this.object);
    }

    remove(){
        this.discountService.remove(this.object);
    }

    cancel() {
        this.discountService.cancelEdit(this.object);
    }

}
