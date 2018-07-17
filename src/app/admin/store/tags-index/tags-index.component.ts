import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";

import {IStore} from "../../../models/interfaces/store.interface";
import {ITag} from "../../../models/interfaces/tag.interface";

import {ObjectsIndexComponent} from "../../../util/objects-index.component";

import {didSet} from "../../../lib/decorators/property/didSet";
import * as moment from 'moment';

import {StoreService} from "../../../services/store.service";
import {TagService} from "../../../services/tag.service";

export function didSetSelectedEmployees(newValue) {
    this.extraFilters.next({
        userId: newValue
    });
}

@Component({
    selector: 'app-time-clocks-index',
    templateUrl: './tags-index.component.html',
    //styleUrls: [ './tags-index.component.css' ]
})

export class TagsIndexComponent extends ObjectsIndexComponent<ITag> implements OnInit, OnDestroy {

    currentStoreEmittedSubscription: Subscription;
    store: IStore;

    constructor(injector: Injector, private tagService: TagService, private storeService: StoreService){
        super(injector, tagService);
    }
    
    ngOnDestroy(){
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit(){
        super.ngOnInit();
        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe( store => {
            this.store = store
            this.extraFilters.next( { storeId: store.id } )
        } )
    }

    search(term: string) {
        if(this.store) this.searchTerms.next(term)
    }

    onRowClick(event, tag: ITag){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewTag(tag);
    }

    viewTag(tag: ITag){
        this.tagService.view(tag);
    }

    editTag(tag: ITag){
        this.tagService.edit(tag);
    }

    createTag(){
        this.tagService.create();
    }

    listTags(){
        this.tagService.list();
    }

}
