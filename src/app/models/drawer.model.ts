import {IDevice} from "./interfaces/device.interface";
import {IDrawer} from "./interfaces/drawer.interface";
import {IReceipt} from "./interfaces/receipt.interface";
import {IUser} from "./interfaces/user.interface";
import {IDrawerLog} from "./interfaces/drawer-log.interface";
import {IIncomingDrawer} from "./incoming-interfaces/incoming-drawer.interface";
import {IDrawerRemoval} from "./interfaces/drawer-removal.interface";
import * as moment from "moment"


export class Drawer implements IDrawer {
    id: string;
    version: number;

    deviceId: string;
    Device?: IDevice;

    Receipts?: IReceipt[];
    Log?: IDrawerLog[];

    userId: string;
    User?: IUser;

    startingAmount: number;
    endingAmount: number;

    DrawerRemovals?: IDrawerRemoval[];

    notesForCloser: string;

    createdAt: Date;
    closedAt: Date;

    closedByUserId: String;
    closedByUser?: IUser;

    constructor(obj: IIncomingDrawer) {
        Object.assign(this, obj);
    }

    get transactionCount() {
        if( this.Receipts === undefined ) return 0

        return this.Receipts.length
    }

    get currentBalance() {
        if( this.Receipts === undefined ) return this.startingAmount;

        return this.Receipts.reduce( ( memo, receipt ) => memo + ( receipt.paymentMethod === 'cash' ? receipt.total : 0), this.startingAmount ) - this.cashRemoved;
    }

    get dailyRevenue() {
        if( this.Receipts === undefined ) return 0

        return this.Receipts.reduce( ( memo, receipt ) => memo + receipt.total, 0 )
    }

    get cashTransactions() {
        if( this.Receipts === undefined ) return 0

        return this.Receipts.reduce( ( memo, receipt ) => memo + ( receipt.paymentMethod === 'cash' ? receipt.total : 0 ), 0 )
    }

    get debitTransactions() {
        if( this.Receipts === undefined ) return 0

        return this.Receipts.reduce( ( memo, receipt ) => memo + ( receipt.paymentMethod != 'cash' ? receipt.total : 0 ), 0 )
    }

    get totalSalesTaxIncluded() {
        if( this.Receipts === undefined ) return 0

        return this.Receipts.reduce( ( total, receipt ) => total + receipt.total, 0 );
    }

    get totalSalesTaxExcluded() {
        if( this.Receipts === undefined ) return 0


        return this.Receipts.reduce( ( total, receipt ) => total + receipt.total - receipt.tax, 0 );
    }

    get taxTotals() {
        if( this.Receipts === undefined ) return 0;

        return this.Receipts.reduce( ( totals, receipt ) => {
            const taxByType = receipt.taxByType;
            Object.keys(taxByType).forEach(taxId => {
                if(!totals[taxId]) totals[taxId] = 0
                totals[taxId] += taxByType[taxId]
            } )
            return totals
        }, { } )
    }

    get salesByProductType() {
        if( this.Receipts === undefined ) return 0;

        return this.Receipts.reduce( ( totals, receipt ) => {
            receipt.LineItems.forEach( lineItem => {
                const productTypeId = lineItem.Product.productTypeId
                if(!totals[productTypeId]) totals[productTypeId] = 0
                totals[productTypeId] += lineItem.total
            } )
            return totals
        }, { } )
    }

    get cashAmount() {
        if( !this.Receipts ) return this.startingAmount

        return this.Receipts.filter( receipt => receipt.paymentMethod === 'cash' ).reduce( ( total, receipt ) => total += receipt.amountPaid - receipt.total, this.startingAmount )
    }

    get cashRemoved(){
        if ( this.DrawerRemovals === undefined ) return 0;
        return this.DrawerRemovals.reduce( ( total, drawerRemoval ) => total + drawerRemoval.removedAmount, 0 );
    }
}
