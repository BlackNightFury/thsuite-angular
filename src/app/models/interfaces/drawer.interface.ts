import {IIncomingDrawer} from "../incoming-interfaces/incoming-drawer.interface";
import {IDrawerRemoval} from "./drawer-removal.interface";

export interface IDrawer extends IIncomingDrawer {
    readonly cashAmount: number;
    readonly currentBalance: number;
    readonly totalSalesTaxIncluded: number;
    readonly totalSalesTaxExcluded: number;

}
