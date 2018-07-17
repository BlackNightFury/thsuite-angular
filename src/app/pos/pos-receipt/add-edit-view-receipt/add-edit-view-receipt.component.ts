import {Component, Injector, OnDestroy, OnInit, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IReceipt} from "../../../models/interfaces/receipt.interface";
import {ReceiptService} from "../../../services/receipt.service";
import {Receipt} from "../../../models/receipt.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AddEditViewObjectComponent} from "../../../util/add-edit-view-object.component";
import {UserService} from "../../../services/user.service";
import {IStore} from "../../../models/interfaces/store.interface";
import {StoreService} from "../../../services/store.service";
import {Subscription} from "rxjs/Subscription";

declare const $;

@Component({
    selector: 'app-add-edit-view-receipt',
    templateUrl: './add-edit-view-receipt.component.html'
})
export class AddEditViewPosReceiptComponent extends AddEditViewObjectComponent<IReceipt> implements OnInit, OnDestroy {

    @ViewChild('root')overlayRoot: ElementRef;
    store: IStore;
    storeSubscription: Subscription;

    cancel() {
        this.receiptService.list()
    }

    constructor(injector: Injector, private receiptService: ReceiptService, private storeService: StoreService ) {
        super(injector, receiptService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.storeSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        })
    }

    ngOnDestroy(): void {
        this.storeSubscription && this.storeSubscription.unsubscribe();
    }
}
