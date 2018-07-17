import {CommonService} from "./common.service";
import {IStoreOversaleLimit} from "../models/interfaces/store-oversale-limit.interface";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {StoreOversaleLimit} from "../models/store-oversale-limit.model";
import * as uuid from "uuid";
// import {Cart} from "./pos-cart.service";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Injectable, Injector} from "@angular/core";
import {IStore} from "../models/interfaces/store.interface";

@Injectable()
export class StoreOversaleLimitService extends CommonService<IStoreOversaleLimit>{

    constructor(injector: Injector, socketService: SocketService) {
        super(injector, 'store-oversale-limits');
    }

    newInstance(): IStoreOversaleLimit{
        throw new Error('Oversale limits cannot be created on frontend');
    }


    dbInstance(fromDb: IStoreOversaleLimit){
        return new StoreOversaleLimit(fromDb);
    }

    instanceForSocket(object: IStoreOversaleLimit) : IStoreOversaleLimit{
        return {
            id: object.id,
            version: object.version,

            storeId: object.storeId,

            cartMax: object.cartMax,
            buds: object.buds,
            shakeTrim: object.shakeTrim,
            plants: object.plants,
            infusedNonEdible: object.infusedNonEdible,
            infusedEdible: object.infusedEdible,
            concentrate: object.concentrate
        }
    }

    check(cart, store: IStore): Observable<boolean>{
        console.log(cart);

        let result = new Subject<boolean>();

        this.socket.emitPromise('getByStoreId', store.id)
            .then((oversaleLimits) => {

                let lineItems = cart.lineItems;

                let cartLimit = oversaleLimits.cartMax;

                let cartScore = 0;
                for(let lineItem of lineItems){
                    let items = lineItem.ProductVariation.Items;
                    let variationQuantity = lineItem.ProductVariation.quantity;
                    let cartCount = lineItem.quantity;
                    let itemScore = 0;
                    for(let item of items){
                        let cannabisCategory = item.ProductType.cannabisCategory;
                        cannabisCategory = cannabisCategory.slice(0,1).toLowerCase() + cannabisCategory.slice(1);

                        let pointValue = oversaleLimits[cannabisCategory];

                        let unitOfMeasure = item.ProductType.unitOfMeasure;
                        let score;
                        if(unitOfMeasure == 'each'){
                            //Score for this item is based on thcWeight
                            let thcWeight = item.thcWeight ? item.thcWeight: 0;
                            score = thcWeight * pointValue;
                        }else{
                            //Score is based on weight
                            score = variationQuantity * pointValue;
                        }

                        itemScore += score;

                    }

                    let lineItemScore = cartCount * itemScore;

                    cartScore += lineItemScore;
                }

                //This was changed because with KK using 3.55 as eighths the decimal multiplication of 8 distinct eighths
                //would make the cart score 28.400000002 -- the score comparison shouldn't be carried out past 3 decimals anyway
                result.next(cartScore - cartLimit > 0.001);

            });

        return result.asObservable();
    }
}
