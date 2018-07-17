import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";

import {StoreService} from "../../../../services/store.service";
import {TagService} from "../../../../services/tag.service";

import {IStore} from "../../../../models/interfaces/store.interface";
import {ITag} from "../../../../models/interfaces/tag.interface";

import * as moment from 'moment';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";


@Component({
    selector: 'app-add-edit-view-tag',
    templateUrl: './add-edit-view-tag.component.html'
    //styleUrls: ['./add-edit-view-tag.component.css']
})
export class AddEditViewTagComponent extends AddEditViewObjectComponent<ITag> implements OnInit, OnDestroy{

    errors: string[] = [];
    errorFlags: {
        value: boolean;
    } = {
        value: false,
    };

    currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(
        injector: Injector,
        private tagService: TagService,
        private storeService: StoreService ) {
        super(injector, tagService);
    }

    ngOnDestroy(){
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit(){
        super.ngOnInit();

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe( store => this.store = store )
    }

    resetErrorFlags(){
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    save(){

        this.resetErrorFlags();

        let errors = [];

        if(!this.object.value.trim()){
            errors.push('Cannot create empty tag name');
            this.errorFlags.value = true;
        }

        if(!this.store){
            errors.push('Cannot create without store');
            this.errorFlags.value = true;
        }

        if(errors.length){
            this.errors = errors;
            return;
        }

        this.object.storeId = this.store.id;

        //TODO: How to handle failed save due to storeId,value unique constraint?
        this.tagService.save(this.object);
        this.tagService.list();

    }

    edit(){
        this.tagService.edit(this.object);
    }

    remove(){
        this.tagService.remove(this.object);
    }

    cancel(){
        this.tagService.list();
    }
}
