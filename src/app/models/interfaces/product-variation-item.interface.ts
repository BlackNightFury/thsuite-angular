import {IItem} from "./item.interface";

export function isIProductVariationItem(item: IItem) : item is IProductVariationItem{
    return !!(<IProductVariationItem>item).ProductVariationItem;
}

export interface IProductVariationItem extends IItem {

    ProductVariationItem: {
        productVariationId: string;
        quantity: number
    }
}
