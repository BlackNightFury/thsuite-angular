import {Component, OnInit, Injector} from "@angular/core";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {IStoreSettings} from "../../../models/interfaces/store-settings.interface";
import {StoreSettingsService} from "../../../services/store-settings.service";
import {UserService} from "../../../services/user.service";
import {ICommon} from "../../../models/interfaces/common.interface";
import {IUser} from "../../../models/interfaces/user.interface";
import {IStore} from "../../../models/interfaces/store.interface";
import {StoreService} from "../../../services/store.service";

@Component({
    selector: 'app-settings-index',
    templateUrl: './settings-index.component.html',
    styleUrls: ['./settings-index.component.css']
})

export class SettingsIndexComponent implements OnInit {

    settings: IStoreSettings;
    store: IStore;

    errors: string[];
    hasEmailErrors: boolean;
    hasNumberErrors: boolean;

    drawerAmountForAlert: any;
    lowInventoryGramThreshold: any;
    lowInventoryEachThreshold: any;

    inactivityOptions: any[] = [
        {
            label: 'Never',
            value: 'never'
        },
        {
            label: '1 minute',
            value: '1min'
        },
        {
            label: '5 minutes',
            value: '5min'
        },
        {
            label: '15 minutes',
            value: '15min'
        },
        {
            label: '1 hour',
            value: '1hr'
        }
    ];

    constructor(injector: Injector, private storeSettingsService: StoreSettingsService, private storeService: StoreService){
    }

    ngOnInit(){

        this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store;
            this.settings = store.settings;
        } );

        this.settings.lowInventoryEachThreshold ?
            this.lowInventoryGramThreshold = this.settings.lowInventoryGramThreshold : this.lowInventoryGramThreshold = '';
        this.settings.lowInventoryEachThreshold ?
            this.lowInventoryEachThreshold = this.settings.lowInventoryEachThreshold : this.lowInventoryEachThreshold = '';
        this.settings.drawerAmountForAlert ?
            this.drawerAmountForAlert = this.settings.drawerAmountForAlert : this.drawerAmountForAlert = '';
    }

    save(){
        this.errors = [];
        let errors = [];
        if(this.hasEmailErrors) errors.push("Error with one of the email inputs. Please fix and retry saving.");
        if(this.hasNumberErrors) errors.push("Error with one of the number inputs. Please fix and retry saving.");
        if (errors.length > 0){
            this.errors = errors;
            return;
        } else{
            this.settings.lowInventoryGramThreshold = parseInt(this.lowInventoryGramThreshold);
            this.settings.lowInventoryEachThreshold = parseInt(this.lowInventoryEachThreshold);
            this.settings.drawerAmountForAlert = parseInt(this.drawerAmountForAlert);
            this.store.settings = this.settings;

            this.storeService.save(this.store, true, ['admin', 'store', 'settings']);
        }
    }

    validateNumber( possibleNumber: any ){
        this.hasNumberErrors = false
        if ( !possibleNumber.trim() || isNaN(Number(possibleNumber)) || possibleNumber < 0 || possibleNumber.includes('.') ) {
            this.hasNumberErrors = true;
        }
    }

    validateEmail( element ) {
        this.hasEmailErrors = false
        element.classList.remove('error')

        if( element.value.trim().length === 0 ) return

        const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        element.value.trim().split(',').forEach( email => {
            email = email.trim()
            if(!email) return
            if(!regex.test(email)) { element.classList.add('error'); this.hasEmailErrors = true }
        } )

    }

    /*
    updateDrawerLimit(updateType: string){
        if (updateType == 'save'){
            if (!this.drawerAmountForAlert.includes('.') && !isNaN(parseFloat(this.drawerAmountForAlert)) &&
            parseInt(this.drawerAmountForAlert) > 0) {

                this.settings.drawerAmountForAlert = this.drawerAmountForAlert;
                this.allowDrawerLimitChange = false;
                this.drawerLimitError = undefined;

                console.log("Drawer Limit Set: " + this.settings.drawerAmountForAlert);

            } else{
                this.drawerLimitError = "Please enter a valid integer.";
            }

        } else if (updateType == 'edit'){

            this.allowDrawerLimitChange = true;
            this.drawerLimitError = undefined;

        }
    }


    // allowDrawerLimitChange: boolean;
    // drawerLimitError: string;

    */
}
