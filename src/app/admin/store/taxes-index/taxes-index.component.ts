import {Component, OnInit, Injector} from "@angular/core";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ITax} from "../../../models/interfaces/tax.interface";
import {TaxService} from "../../../services/tax.service";
import {UserService} from "../../../services/user.service";
import {IUser} from "../../../models/interfaces/user.interface";
import {IStore} from "../../../models/interfaces/store.interface";
import {StoreService} from "../../../services/store.service";

@Component({
    selector: 'app-taxes-index',
    templateUrl: './taxes-index.component.html'
})
export class TaxesIndexComponent extends ObjectsIndexComponent<ITax> implements OnInit{

    user: IUser;
    store: IStore;
    savedIndicator: boolean = false;

    taxIncludedOptions = [
        {
            label: "Yes",
            value: true
        },
        {
            label: "No",
            value: false
        }
    ];

    constructor(injector: Injector, private taxService: TaxService, private storeService: StoreService){
        super(injector, taxService);
    }

    ngOnInit(){
        super.ngOnInit();
        this.userService.userEmitted.subscribe(user => {
            this.user = user;
        });

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
        })
    }

    taxToggle(){
        this.storeService.save(this.store, false);
        this.savedIndicator = true;
        setTimeout(() => {
            this.savedIndicator = false;
        }, 1000)
    }

    onRowClick(event, tax: ITax){
        this.taxService.view(tax);
    }

    createNewTax() {
        this.taxService.create();
    }
    editTax(tax: ITax) {
        this.taxService.edit(tax);
    }
    viewTax(tax: ITax) {
        this.taxService.view(tax);
    }

    listTaxes(){
        this.taxService.list();
    }

}
