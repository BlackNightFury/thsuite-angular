import {ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {IProduct} from "../../../../../../models/interfaces/product.interface";
import {IStore} from "../../../../../../models/interfaces/store.interface";
import {Observable} from "rxjs/Observable";
import {IProductVariation} from "../../../../../../models/interfaces/product-variation.interface";
import {ProductService} from "../../../../../../services/product.service";
import {ProductVariationService} from "../../../../../../services/product-variation.service";
import {CommonAdapter} from "../../../../../../util/select2-adapters/common-adapter";
import {ItemService} from "../../../../../../services/item.service";
import {Item} from "../../../../../../models/item.model";
import {Subject} from "rxjs";
import {ProductVariation} from "../../../../../../models/product-variation.model";
import {IProductVariationItem} from "../../../../../../models/interfaces/product-variation-item.interface";
import {ProductVariationItem} from "../../../../../../models/product-variation-item.model";
import {BarcodeService} from "../../../../../../services/barcode.service";
import {TagService} from "../../../../../../services/tag.service";
import {StoreService} from "../../../../../../services/store.service";
import {IBarcode} from "../../../../../../models/interfaces/barcode.interface";
import {IPackage} from "../../../../../../models/interfaces/package.interface";
import {ITag} from "../../../../../../models/interfaces/tag.interface";
import {Product} from "../../../../../../models/product.model";
import {trigger, state, style, animate, transition} from '@angular/animations';
import {environment} from "../../../../../../../environments/environment";
import * as formatCurrency from 'format-currency';

@Component({
    selector: 'app-add-edit-variation',
    templateUrl: './add-edit-view-variation.component.html',
    styleUrls: ['./add-edit-view-variation.component.css'],
    animations: [
      trigger('leave', [
        transition('inactive => active', [
            animate(150, style({opacity: '0', transform: 'translateX(150px)'}))
        ])
      ])
    ]
})
export class AddEditViewVariationComponent implements OnInit, AfterViewInit {
    @ViewChild('root')overlayRoot: ElementRef;

    mode: string = 'add';
    environment: any = environment;
    selectedItemIdsSource: Subject<string[]> = new Subject();
    selectedTagIdsSource: Subject<string[]> = new Subject();

    errors: string[];

    errorFlags: {
        name: boolean;
        quantity: boolean;
        price: boolean;
    } = {
        name: false,
        quantity: false,
        price: false
    }

    //kinda hacky but these need to be set before productVariation for select2 initialization
    itemSelectOptions : Select2Options;
    tagSelectOptions : Select2Options;

    private _selectedItemIds: string[] = [];
    set selectedItemIds(value: string[]) {
        this._selectedItemIds = value;
        this.selectedItemIdsSource.next(value);
    }
    get selectedItemIds() {
        return this._selectedItemIds;
    }

    private _selectedTagIds: string[] = [];
    set selectedTagIds(value: string[]) {
        this._selectedTagIds = value;
        this.selectedTagIdsSource.next(value);
    }
    get selectedTagIds() {
        return this._selectedTagIds;
    }


    productObservable: Observable<IProduct>;
    productVariationObservable: Observable<IProductVariation>;

    product: IProduct;
    productVariation: IProductVariation;

    productVariationItems: IProductVariationItem[];
    // productVariationPackages: IPackage[];

    totalProductVariationsAvailable: number;

    barcodes: IBarcode[] = [];
    tags: ITag[] = [];
    store: IStore;

    variationNameExplanationShowing = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        private productService: ProductService,
        private productVariationService: ProductVariationService,
        private itemService: ItemService,
        private barcodeService: BarcodeService,
        private tagService: TagService,
        private storeService: StoreService
    ) {
    }

    ngOnInit() {

        this.productObservable = this.route.parent.parent.params.map(params => params['id'])
            .switchMap((id: string) => {
                console.log("Loading product with id: " + id);
                return this.productService.getAssociated(id);
            });
        this.productObservable.subscribe(product => {

            if (this.product) {
                //TODO dirty check
            }

            console.log(product);
            this.product = product;
        });

        this.productVariationObservable = Observable.combineLatest(this.route.params, this.route.data)
            .map(([params, data]) => {
                this.mode = data.mode;

                return params['id'];
            })
            .switchMap((id: string|undefined) => {
                console.log("Loading productVariation with id: " + id)
                return id ? this.productVariationService.getAssociated(id) : Observable.of(this.productVariationService.newInstance())
            });

        this.productVariationObservable.subscribe( async productVariation => {

            if (this.productVariation) {
                //TODO dirty check
            }

            console.log(productVariation);
            productVariation = new ProductVariation(productVariation);

            //Get barcodes
            Observable.combineLatest(this.barcodeService.getByProductVariationId(productVariation.id),(barcodes) => {
                this.barcodes = barcodes;
            });

            this.tagService.getByProductVariationId(productVariation.id).subscribe( tags => {
                productVariation.Tags = tags
                if(productVariation.Tags) {
                    this.selectedTagIds = productVariation.Tags.map(tag => tag.id)
                }
            })


            let unit = this.product.inventoryType.charAt(0).toUpperCase() + this.product.inventoryType.slice(1);

            if(unit == "Weight"){
                unit = "Grams";
            }

            let itemTerms = {
                unit: unit
            };


            let category = this.product.ProductType.category;

            if(category === 'non-cannabis'){
                itemTerms['cannabisCategory'] = category
            }

            Observable.combineLatest(
                CommonAdapter(this.itemService, 'id', 'name', itemTerms),
                CommonAdapter(this.tagService, 'id', 'value', {storeId: productVariation.storeId})
            ).toPromise()
                .then(([ItemAdapter, TagAdapter]) => {

                    let itemSelectOptions = {
                        multiple: true,
                        ajax: {}
                    };
                    itemSelectOptions['dataAdapter'] = ItemAdapter;
                    this.itemSelectOptions = itemSelectOptions;

                    this.productVariation = productVariation;
                    this.productVariationItems = productVariation.Items;

                    //Can be set to disabled if the specific product variation is readOnly or this product has an item id
                    itemSelectOptions['disabled'] = (this.productVariation.readOnly === 1 || this.product.itemId);

                    //If this product has an itemId, product variations can only ever contain that item
                    if(this.product.itemId){
                        this.selectedItemIds = [this.product.itemId];
                    }else{
                        this.selectedItemIds = productVariation.Items.map(item => item.id);
                    }

                    let tagSelectOptions = {
                        multiple: true,
                        ajax: {}
                    };

                    tagSelectOptions['dataAdapter'] = TagAdapter;
                    tagSelectOptions['disabled'] = this.mode === 'view';
                    this.tagSelectOptions = tagSelectOptions;


                    this.productVariation = productVariation;

                })
        });


        this.selectedTagIdsSource.switchMap( ids => {
            return ids.length ? Observable.combineLatest(ids.map(id => this.tagService.get(id))) : Observable.of([]);
        })
        .subscribe(tags => {
            console.log(tags);
            this.productVariation.Tags = tags
        })

        this.selectedItemIdsSource
            .switchMap((ids) => {
                return ids.length ? Observable.combineLatest(ids.map(id => this.itemService.get(id))) : Observable.of([]);
            })
            .subscribe(items => {
                let currentItems = this.productVariation.Items;
                console.log(currentItems);
                let newItems = [];

                for(let item of items) {
                    console.log(item);
                    let currentItem = currentItems.find(currentItem => currentItem.id == item.id);
                    if(currentItem) {
                        newItems.push(currentItem);
                    }
                    else {
                        newItems.push(new ProductVariationItem(item, {quantity: 0, productVariationId: this.productVariation.id}));
                    }
                }

                this.productVariation.Items = newItems;
                this.productVariationItems = newItems;


                this.totalProductVariationsAvailable = Number.MAX_SAFE_INTEGER;
                this.productVariationItems.forEach(item => {
                    console.log(item);
                    let itemQuantity = item.ProductVariationItem.quantity;
                    let packages = item.Packages;
                    let totalQuantity = packages.reduce(function(sum, value){

                        return sum + value.availableQuantity;

                    }, 0);

                    let possibleInventory = Math.floor(totalQuantity / itemQuantity);

                    this.totalProductVariationsAvailable = Math.min(this.totalProductVariationsAvailable, possibleInventory);

                });

                if(!this.productVariationItems.length || this.totalProductVariationsAvailable === Number.MAX_SAFE_INTEGER){
                    this.totalProductVariationsAvailable = 0;
                }

            });

    }

    onBarcodeClick(event, barcode: IBarcode) {
        if ($(event.target).is('i')) {
            return;
        }

        this.barcodeService.view(barcode);
    }

    addBarcode(){
        this.barcodeService.createFromProductVariation(this.productVariation);
    }

    selectedItemsChanged(e) {
        console.log("selectedItemsChanged: " + e.value);

        this.selectedItemIdsSource.next(e.value)
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    animationStatus = 'inactive';

    startLeaving() {
        this.animationStatus = 'active';
    }

    cancel() {
        if (this.animationStatus === 'active') {
            this.router.navigate(['../..'], {relativeTo: this.route});
        }
    }

    save() {
        this.clearErrorFlags();
        let errors = [];

        //Have to set product variation quantity manually
        if(this.product.inventoryType == 'weight'){
            let quantity = 0;
            if(!this.productVariation.isBulkFlower){
                this.productVariationItems.forEach(item => {
                    quantity += item.ProductVariationItem.quantity;
                });

                this.productVariation.quantity = quantity;
            }else{
                //Bulk flower always has a weight of 1
                this.productVariation.quantity = 1;
            }

        }else{
            this.productVariation.quantity = 1;
        }

        if(!this.productVariation.name){
            errors.push('Name is a required field.');
            this.errorFlags.name = true;
        }
        if(!this.productVariation.quantity && this.product.inventoryType == 'weight'){
            errors.push('Quantity is a required field and cannot be 0.');
            this.errorFlags.quantity = true;
        }
        if(this.product.inventoryType != 'weight' && !this.productVariation.price){
            errors.push('Price is a required field and cannot be 0.');
            this.errorFlags.price = true;
        }

        if(errors.length){
            setTimeout( () => {
                $('#variationName1').attr('placeholder', 'Example: 1ea, 1g, sample, etc');
                $('#variationName2').attr('placeholder', 'Example: 1ea, 1g, sample, etc');
            }, 10);
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.productVariation.productId = this.product.id;

        //this.productVariation = new ProductVariation(this.productVariation);

        let productVariationToSave = new ProductVariation(this.productVariation);
        productVariationToSave.readOnly = 1;

        delete productVariationToSave.Product;

        let itemsToSave = [];
        this.productVariation.Items.forEach( item => {
            if(this.productVariation.isBulkFlower){
                //Bulk flower variations always have quantity 1
                item.ProductVariationItem.quantity = 1;
            }
            let itemToSave = new Item(item);
            itemToSave.Packages = undefined;
            itemToSave.ProductType = undefined;
            itemToSave.Supplier = undefined;
            itemsToSave.push(itemToSave);
        } );
        productVariationToSave.Items = itemsToSave;

        this.productVariationService.save(productVariationToSave);

        this.productVariationService.list(this.product);
    }

    async remove(){
        let errors = [];
        if(!(await this.productVariationService.canRemove(this.productVariation))){
            errors.push("Cannot remove a product variation that has barcodes allocated to it.");
            this.errors = errors;
            return;
        }else{
            this.productVariationService.remove(this.productVariation, this.product);
        }

    }

    set pricingTierPrice(value: string){
        //NOOP
    }

    get pricingTierPrice(){
        let quantity = 0;
        this.productVariationItems.forEach(item => {
            quantity += item.ProductVariationItem.quantity;
        });

        this.productVariation.quantity = quantity;
        if(this.product.PricingTier){
            let pricePer = ProductVariationService.getPriceFromTier(this.productVariation, this.product.PricingTier);
            return formatCurrency(pricePer * quantity, { format: '%s%v', code: 'USD', symbol: '$' });
        }else{
            //No pricing tier set, cannot show price
            return "No Pricing Tier";
        }


    }

    toggleVariationNameExplanation(){
        this.variationNameExplanationShowing = !this.variationNameExplanationShowing;
    }

    ngAfterViewInit(): void {
        setTimeout( () => {
            $('#variationName1').attr('placeholder', 'Example: 1ea, 1g, sample, etc');
            $('#variationName2').attr('placeholder', 'Example: 1ea, 1g, sample, etc');
        }, 10);
    }

}
