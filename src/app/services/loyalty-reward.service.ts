import {ILoyaltyReward} from "../models/interfaces/loyalty-reward.interface";
import {IStore} from "../models/interfaces/store.interface";
import {SearchableService} from "./searchable.service";
import {CommonService} from "./common.service";
import {Mixin} from "../lib/decorators/class/mixin";
import {Injectable, Injector} from "@angular/core";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {LoyaltyReward} from "../models/loyalty-reward.model";
import * as uuid from "uuid";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Observable} from "rxjs/Observable";
import {SearchResult} from "../lib/search-result";
import {ObjectObservable} from "../lib/object-observable";
import {PosCartService} from "./pos-cart.service";
import {DiscountService} from "./discount.service";
import {TagService} from "./tag.service";
import {Discount} from "../models/discount.model";
import {Cart} from "../models/cart.model";


@Injectable()
@Mixin([SearchableService])
export class LoyaltyRewardService extends CommonService<ILoyaltyReward> implements SearchableService<ILoyaltyReward>{

    constructor(injector: Injector, private tagService: TagService, private discountService: DiscountService, private cartService: PosCartService){
        super(injector, 'loyalty-rewards');
    }

    search: (query: string, page: number, sortBy: SortBy, extraArgs: any) => Observable<SearchResult<ILoyaltyReward>>;

    newInstance() {
        return new LoyaltyReward({
            id: uuid.v4(),
            version: 0,

            name: '',
            points: 0,

            discountAmountType: 'percent',
            discountAmount: 0,

            appliesTo: 'order',

            numItems: 0,

            isActive: true

        });
    }

    dbInstance(fromDb: ILoyaltyReward) {
        return new LoyaltyReward(fromDb);
    }

    instanceForSocket(object: ILoyaltyReward) {
        return {
            id: object.id,
            version: object.version,

            name: object.name,
            points: object.points,

            discountAmountType: object.discountAmountType,
            discountAmount: object.discountAmount,

            appliesTo: object.appliesTo,

            numItems: object.numItems,

            isActive: object.isActive
        }
    }

    resolveAssociations(loyaltyReward: ILoyaltyReward): ObjectObservable<ILoyaltyReward>{

        let obs: Observable<ILoyaltyReward>;

        if(loyaltyReward.Tags && loyaltyReward.Tags.length){
            let tagsObservable = Observable.combineLatest(
                loyaltyReward.Tags.map(tag => {
                    return this.tagService.getAssociated(tag.id);
                })
            );

            obs = Observable.combineLatest(
                tagsObservable,
                (tags) => {
                    loyaltyReward.Tags = tags;

                    return loyaltyReward;
                }
            );
        }else{

            obs = Observable.combineLatest(
                this.tagService.getByLoyaltyRewardId(loyaltyReward.id)
            ).map(([tags]) => {

                loyaltyReward.Tags = tags;
                return loyaltyReward;
            });
        }

        return new ObjectObservable(obs, loyaltyReward.id);
    }

    calculateLoyaltyRewardDiscount(loyaltyReward: ILoyaltyReward, cart: Cart, store: IStore){
        //If loyalty reward is product -- calculate discounts for number of items
        //If loyalty reward is order -- create single discount
        let discounts = [];
        if(loyaltyReward.appliesTo == 'order'){

            let totalDiscountAmount;
            if(loyaltyReward.discountAmountType == 'dollar'){
                let cartTotal = store.taxesIncluded ? cart.total : cart.subtotal;
                totalDiscountAmount = loyaltyReward.discountAmount;

                for(let lineItem of cart.lineItems){

                    let proportion = lineItem.price / cartTotal;

                    let discountAmount = proportion * totalDiscountAmount;

                    let discount = new Discount({
                        id: uuid.v4(),
                        version: 0,

                        name: `${loyaltyReward.name} (${loyaltyReward.points} points)`,
                        code: undefined,

                        amountType: loyaltyReward.discountAmountType,
                        amount: discountAmount,

                        minimumType: 'items',
                        minimum: 0,

                        maximum: undefined,

                        startDate: null,
                        endDate: null,

                        startTime: null,
                        endTime: null,

                        days: [],
                        patientType: 'all',
                        patientGroupId: undefined,
                        productTypeId: undefined,
                        productId: undefined,
                        packageId: undefined,
                        productVariationId: undefined,
                        lineItemId: lineItem.id,
                        supplierId: undefined,
                        isActive: true,
                        isAutomatic: true,
                        isCustom: true,
                        isOverride: false,
                        managerApproval: false,
                        thcType: 'all',
                        notes: ''
                    });

                    this.discountService.save(discount,false)
                    discounts.push(discount);
                }

            }else{
                totalDiscountAmount = loyaltyReward.discountAmount;
                let discount = new Discount({
                    id: uuid.v4(),
                    version: 0,

                    name: `${loyaltyReward.name} (${loyaltyReward.points} points)`,
                    code: undefined,

                    amountType: loyaltyReward.discountAmountType,
                    amount: totalDiscountAmount,

                    minimumType: 'items',
                    minimum: 0,

                    maximum: undefined,

                    startDate: null,
                    endDate: null,

                    startTime: null,
                    endTime: null,

                    days: [],
                    patientType: 'all',
                    patientGroupId: undefined,
                    productTypeId: undefined,
                    productId: undefined,
                    packageId: undefined,
                    productVariationId: undefined,
                    lineItemId: undefined,
                    supplierId: undefined,
                    isActive: true,
                    isAutomatic: true,
                    isCustom: true,
                    isOverride: false,
                    managerApproval: false,
                    thcType: 'all',
                    notes: ''
                });

                this.discountService.save(discount,false)
                discounts.push(discount);
            }

        }else if(loyaltyReward.appliesTo == 'product'){
            //TODO: This doesn't allow for two free items from the same line item
            let addedVariations = [];
            let loyaltyTagIds = new Set( loyaltyReward.Tags.map(tag => tag.id) )
            let numItems = loyaltyReward.numItems;
            let lineItems = cart.lineItems;
            for(let i = 0; i < numItems; i++){
                //Go through cart and find lowest price item with product variation in this reward
                let lowestPrice = Number.MAX_SAFE_INTEGER;
                let lowestVariationId = '';
                let lowestLineItemId;
                for(let lineItem of lineItems){
                    let productVariationId = lineItem.productVariationId;
                    let productVariationTagIds = new Set( lineItem.ProductVariation.Tags.map( tag => tag.id ) )
                    let variationPrice = lineItem.price / lineItem.quantity;
                    //If this variation is part of the reward tier AND this variation hasn't been added already
                    if(lineItem.ProductVariation.Tags.findIndex( tag => loyaltyTagIds.has(tag.id) ) !== -1 && addedVariations.indexOf(productVariationId) === -1){
                        if(variationPrice < lowestPrice){
                            lowestPrice = variationPrice;
                            lowestVariationId = productVariationId;
                            lowestLineItemId = lineItem.id
                        }
                    }
                }

                if(lowestVariationId) {
                    addedVariations.push(lowestVariationId);

                    let discount = new Discount({
                        id: uuid.v4(),
                        version: 0,

                        name: `${loyaltyReward.name} (${loyaltyReward.points} points)`,
                        code: undefined,

                        amountType: 'dollar',
                        amount: lowestPrice,

                        minimumType: 'items',
                        minimum: 0,

                        maximum: undefined,

                        startDate: null,
                        endDate: null,

                        startTime: null,
                        endTime: null,

                        days: [],
                        patientType: 'all',
                        patientGroupId: undefined,
                        productTypeId: undefined,
                        productId: undefined,
                        packageId: undefined,
                        lineItemId: lowestLineItemId,
                        productVariationId: lowestVariationId,
                        supplierId: undefined,
                        isActive: true,
                        isAutomatic: true,
                        isCustom: true,
                        isOverride: false,
                        managerApproval: false,
                        thcType: 'all',
                        notes: ''
                    });

                    this.discountService.save(discount,false)

                    discounts.push(discount);
                }
            }

        }

        return discounts;
    }

    create(){
        this.router.navigate(['admin', 'store', 'rewards', 'add']);
    }

    edit(object: ILoyaltyReward){
        this.router.navigate(['admin', 'store', 'rewards', 'edit', object.id]);
    }

    view(object: ILoyaltyReward){
        this.router.navigate(['admin', 'store', 'rewards', 'view', object.id]);
    }

    list(){
        this.router.navigate(['admin', 'store', 'rewards']);
    }

    save(object: ILoyaltyReward){
        super.save(object);

        this.router.navigate(['admin', 'store', 'rewards']);
    }

    remove(object: ILoyaltyReward){
        this.socket.emitPromise('remove', object.id);
        this.router.navigate(['admin', 'store', 'rewards']);
    }

}
