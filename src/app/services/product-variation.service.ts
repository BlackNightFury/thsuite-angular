import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import {IProduct} from "../models/interfaces/product.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {SearchResult} from "../lib/search-result";
import {ProductService} from "./product.service";
import {Router} from "@angular/router";
import {IProductVariation} from "../models/interfaces/product-variation.interface";
import {ProductVariation} from "../models/product-variation.model";
import {ItemService} from "./item.service";
import {ProductVariationItem} from "../models/product-variation-item.model";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Mixin} from "../lib/decorators/class/mixin";
import {BarcodeService} from "./barcode.service";
import {SearchableService} from "./searchable.service";
import {StoreService} from "./store.service";
import {TagService} from "./tag.service";
import {IPricingTier} from "../models/interfaces/pricing-tier.interface";
import {IStore} from "../models/interfaces/store.interface";


@Injectable()
@Mixin([SearchableService])
export class ProductVariationService extends CommonService<IProductVariation> implements SearchableService<IProductVariation> {

    private productService: ProductService;
    // private itemService: ItemService;

    private store: IStore;

    constructor(
        private itemService: ItemService,
        injector: Injector,
        private barcodeService: BarcodeService,
        private tagService: TagService,
        private storeService: StoreService
    ) {
        super(injector, 'product-variations');

        setTimeout(() => {
            this.productService = injector.get<ProductService>(ProductService);
            // this.itemService = injector.get<ItemService>(ItemService)
        });

        this.storeService.currentStoreEmitted.subscribe( store => this.store = store )
    }


    search: (query: string, page: number, sortBy: SortBy, extraArgs: any) => Observable<SearchResult<IProductVariation>>;

    getByTag(tag: string): Promise<ObjectObservable<IProductVariation>> {

        return new Promise(resolve => {
            this.socket.emitPromise('getByTag', tag)
                .then(packageId => {
                    resolve(this.getAssociated(packageId));
                });
        })

    }

    getByProductId(productId: string): Observable<ObjectObservable<IProductVariation>[]> {

        const results = new Subject<ObjectObservable<IProductVariation>[]>();

        this.socket.emitPromise('getByProductId', productId)
            .then(productVariationIds => {
                results.next(productVariationIds.map(id => this.get(id)));
            });

        return results.asObservable()
    }

    getProductVariationsByItemId(itemId: string): Observable<ObjectObservable<IProductVariation>[]> {
        const results = new Subject<ObjectObservable<IProductVariation>[]>();

        this.socket.emitPromise('getProductVariationsByItemId', itemId)
            .then(productVariationIds => {
                results.next(productVariationIds.map(id => this.get(id)));
            });

        return results.asObservable()
    }

    newInstance() {
        return new ProductVariation({
            id: uuid.v4(),
            version: 0,

            clientId: '',
            storeId: this.store.id,

            productId: '',

            readOnly: 0,
            isBulkFlower: false,

            name: '',
            description: '',
            price: 0,
            quantity: 0,

            Items: [],
            Tags: []
        });
    }

    dbInstance(fromDb: IProductVariation) {
        return new ProductVariation(fromDb);
    }

    instanceForSocket(object: IProductVariation): IProductVariation {

        let itemsForSocket = object.Items.map(item => this.itemService.instanceForSocket(item));

        return {
            id: object.id,
            version: object.version,

            clientId: object.clientId,
            storeId: object.storeId,

            productId: object.productId,

            readOnly: object.readOnly,
            isBulkFlower: object.isBulkFlower,

            name: object.name,
            description: object.description,
            price: object.price,
            quantity: object.quantity,

            Items: itemsForSocket,
            Tags: object.Tags
        }
    }

    refresh(productVariation: IProductVariation) {
        super.refresh(productVariation);

        this.productService.refreshAssociations(productVariation.productId)
    }

    resolveAssociations(productVariation: IProductVariation): ObjectObservable<IProductVariation> {

        let itemsObservable: Observable<ProductVariationItem[]>;
        if(productVariation.Items && productVariation.Items.length) {
            itemsObservable = Observable.combineLatest(productVariation.Items.map(variationItem => {
                return this.itemService.getAssociated(variationItem.id)
                    .map(item => new ProductVariationItem(item, variationItem.ProductVariationItem))
            }));
        }
        else {
            itemsObservable = Observable.of([])
        }

        let obs = Observable.combineLatest(
            this.productService.getAssociated(productVariation.productId),
            itemsObservable,
            this.tagService.getByProductVariationId(productVariation.id),
            // this.barcodeService.getByProductVariationId(productVariation.id),
            (product, items, tags) => {
                productVariation.Product = product;
                productVariation.Items = items;
                productVariation.Tags = tags || [ ];

                productVariation.Barcodes = [];

                return productVariation;
            }
        );

        return new ObjectObservable(obs, productVariation.id);

    }

    create(product: IProduct) {
        this.router.navigate(['admin', 'inventory', 'products', 'edit', product.id, 'variations', 'add']);
    }

    edit(product: IProduct, productVariation: IProductVariation) {
        this.router.navigate(['admin', 'inventory', 'products', 'edit', product.id, 'variations', 'edit', productVariation.id])
    }

    list(product: IProduct) {
        this.router.navigate(['admin', 'inventory', 'products', 'edit', product.id, 'variations']);
    }

    canRemove(variation: IProductVariation): Promise<boolean>{
        return this.socket.emitPromise('canRemove', variation.id)
    }

    remove(variation: IProductVariation, product: IProduct){
        this.socket.emitPromise('remove', variation.id);
        this.router.navigate(['admin', 'inventory', 'products', 'edit', product.id, 'variations']);
    }

    public static getPriceFromTier(productVariation: IProductVariation, pricingTier: IPricingTier) : number {
        let productWeight = productVariation.quantity;
        let price = 0;
        for (let tierWeight of pricingTier.PricingTierWeights) {
            if (productWeight >= tierWeight.weight) {
                price = tierWeight.price;
            }
        }
        return price;
    }
}
