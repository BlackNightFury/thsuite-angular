import {ITransactionTax} from "../models/interfaces/transaction-tax.interface";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {TransactionTax} from "../models/transaction-tax.model";
import * as uuid from "uuid";
import {Injectable, Injector} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {ObjectObservable} from "../lib/object-observable";

@Injectable()
export class TransactionTaxService extends CommonService<ITransactionTax>{

    constructor(injector: Injector){
        super(injector, 'transaction-taxes');
    }

    getByTransactionId(transactionId: string){
        let results = new Subject<ObjectObservable<ITransactionTax>[]>();
        this.socket.emitPromise('getByTransactionId', transactionId)
            .then(transactionTaxIds => {
                results.next(transactionTaxIds.map(id => this.get(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    newInstance(){
        return new TransactionTax({
            id: uuid.v4(),
            version: 0,

            transactionId: '',
            taxId: '',
            amount: 0
        });
    }

    dbInstance(fromDb: ITransactionTax){
        return new TransactionTax(fromDb);
    }

    instanceForSocket(object: ITransactionTax) : ITransactionTax{
        return {
            id: object.id,
            version: object.version,

            transactionId: object.transactionId,

            taxId: object.taxId,
            amount: object.amount
        };
    }

    async remove(transactionTax: ITransactionTax ) {
        return this.socket.emitPromise( 'remove', transactionTax.id )
    }
}
