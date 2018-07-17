import {Component, Injector, OnDestroy, OnInit, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IProduct} from "../../../../models/interfaces/product.interface";
import {ProductService} from "../../../../services/product.service";
import {Product} from "../../../../models/product.model";
import {ProductTypeService} from "../../../../services/product-type.service";
import {IProductType} from "../../../../models/interfaces/product-type.interface";
import {ISupplier} from "../../../../models/interfaces/supplier.interface";
import {SupplierService} from "../../../../services/supplier.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FileHolder, ImageUploadComponent} from "angular2-image-upload/lib/image-upload/image-upload.component";
import {Http} from "@angular/http";
import {IProductVariation} from "../../../../models/interfaces/product-variation.interface";
import {IItem} from "../../../../models/interfaces/item.interface";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {UserService} from "../../../../services/user.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PricingTierService} from "../../../../services/pricing-tier.service";
import {didSet} from "../../../../lib/decorators/property/didSet";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {ProductVariationService} from "../../../../services/product-variation.service";
import {TagService} from "../../../../services/tag.service";
import {ITag} from "../../../../models/interfaces/tag.interface";
import {IUser} from "../../../../models/interfaces/user.interface";
import {Subject} from "rxjs";

declare const $;

class ItemWithProportion {
    constructor(public item: IItem, public proportion: number) {}
}

@Component({
    selector: 'app-add-edit-view-product',
    templateUrl: './add-edit-view-product.component.html',
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewProductComponent extends AddEditViewObjectComponent<IProduct> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    get variationsShowing() {
        return !!this.route.firstChild;
    }


    productTypes: Observable<IProductType>[];
    suppliers: Observable<ISupplier>[];

    pricingTierSelect2Options: Select2Options;
    pricingTierSelect2InitialValue: string[] = [];
    selectedTagIdsSource: Subject<string[]> = new Subject();

    errors: string[];

    errorFlags: {
        productTypeId: boolean;
        name: boolean;
        inventoryType: boolean;
        pricingTier: boolean;
    } = {
        productTypeId: false,
        name: false,
        inventoryType: false,
        pricingTier: false
    };

    user: IUser;

    tagSelectOptions : Select2Options;
    private _selectedTagIds: string[] = [];
    set selectedTagIds(value: string[]) {
        this._selectedTagIds = value;
        this.selectedTagIdsSource.next(value);
    }
    get selectedTagIds() {
        return this._selectedTagIds;
    }

    tags: ITag[] = [];

    @ViewChild(ImageUploadComponent) private imageUploadComponent: ImageUploadComponent;

    constructor(injector: Injector,
      private productService: ProductService,
      private productTypeService: ProductTypeService,
      private productVariationService: ProductVariationService,
      private supplierService: SupplierService,
      private pricingTierService: PricingTierService,
      private http: Http,
      private tagService: TagService) {
        super(injector, productService);
    }

    ngOnInit() {
        super.ngOnInit();

        this.productTypeService.all().subscribe(productTypes => {
            this.productTypes = productTypes;
        });

        this.supplierService.all().subscribe(suppliers => {
            this.suppliers = suppliers;
        });

        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.objectObservable.subscribe(() => {

            Observable.combineLatest(
                CommonAdapter(this.pricingTierService, 'id', 'name'),
                CommonAdapter(this.tagService, 'id', 'value', {storeId: this.object.storeId})
            ).toPromise()
                .then(([PricingTierAdapter, TagAdapter]) => {

                    this.pricingTierSelect2Options = {
                        ajax: {},
                        placeholder: 'Select Pricing Tier',
                        allowClear: true
                    };
                    this.pricingTierSelect2Options['dataAdapter'] = PricingTierAdapter;
                    this.pricingTierSelect2InitialValue = [];

                    let tagSelectOptions = {
                        multiple: true,
                        ajax: {}
                    };

                    tagSelectOptions['dataAdapter'] = TagAdapter;
                    tagSelectOptions['disabled'] = this.mode === 'view';
                    this.tagSelectOptions = tagSelectOptions;
                });

            this.selectedTagIdsSource.switchMap( ids => {
                return ids.length ? Observable.combineLatest(ids.map(id => this.tagService.get(id))) : Observable.of([]);
            })
            .subscribe(tags => {
                this.object.Tags = tags
            });

            this.tagService.getByProductId(this.object.id).subscribe(tags => {
                this.object.Tags = tags
                if (this.object.Tags) {
                    this.selectedTagIds = this.object.Tags.map(tag => tag.id);
                }
            })
        });
    }

    ngOnDestroy(): void {

    }

    uploadImage($event: FileHolder) {

        this.productService.getUploadParams()
            .then(params => {
                console.log(params);

                const formData = new FormData();

                var sanitizedFileName = $event.file.name.replace(/[^\w.]+/g, "_");

                formData.append('key', params.name);
                formData.append('AWSAccessKeyId', params.key);
                formData.append('policy', params.policy);
                formData.append('success_action_status', '201');
                formData.append('signature', params.signature);
                formData.append('Content-Type', params.contentType);
                formData.append('file', $event.file, sanitizedFileName);

                return this.http
                    .post(params.action, formData)
                    .toPromise()
            })
            .then(response => {
                console.log(response);
                if (response.status !== 201) {
                    throw new Error('Error uploading image')
                }

                let $response = $(response._body);

                this.object.image = decodeURIComponent($response.find('Location').text());

                this.imageUploadComponent.deleteAll();
            })
            .catch(err => {
                alert(err.message);
            })

    }

    toggleVariations() {
        if(!this.variationsShowing) {
            this.router.navigate(['variations'], {relativeTo: this.route});
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
        this.productService.edit(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];
        if (!this.object.productTypeId) {
            errors.push('Products must have a product type.');
            this.errorFlags.productTypeId = true;
        }
        if (!this.object.name) {
            errors.push('Name is a required field.');
            this.errorFlags.name = true;
        }
        if (!this.object.inventoryType) {
            errors.push('This product must have an inventory type.');
            this.errorFlags.inventoryType = true;
        }
        if(this.object.inventoryType == 'weight' && !this.object.pricingTierId){
            errors.push("This product must have a pricing tier");
            this.errorFlags.pricingTier = true;
        }

        if (errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.productService.save(this.object, this.mode == 'add');
    }

    async remove(){
        let errors = [];
        if(!(await this.productService.canRemove(this.object))){
            errors.push("Cannot delete a product if product variations are uneligible for deletion");
            this.errors = errors;
            return;
        }else{
            this.productService.remove(this.object);
        }
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.productService.list();
        }
    }
}
