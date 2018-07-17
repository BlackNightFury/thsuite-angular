import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {ILoyaltyReward} from "../../../../models/interfaces/loyalty-reward.interface";
import {Component, Injector} from "@angular/core";
import {LoyaltyRewardService} from "../../../../services/loyalty-reward.service";
import {StoreService} from "../../../../services/store.service";
import {TagService} from "../../../../services/tag.service";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {Subject} from "rxjs/Subject";
import {didSet} from "../../../../lib/decorators/property/didSet";
import {Observable} from "rxjs/Observable";
import {Store} from "../../../../models/store.model";
import {Tag} from "../../../../models/tag.model";

export function didSetSelectedTagIds(newValue: string[]){
    this.selectedTagIdsSource.next(newValue);
}

@Component({
    selector: 'app-add-edit-view-loyalty-reward',
    templateUrl: './add-edit-view-loyalty-reward.component.html'
})
export class AddEditViewLoyaltyRewardComponent extends AddEditViewObjectComponent<ILoyaltyReward>{

    errors: string[] = [];

    errorFlags: {
        name: boolean,
        points: boolean,
        discountAmount: boolean,
        tags: boolean,
        numItems: boolean
    } = {
        name: false,
        points: false,
        discountAmount: false,
        tags: false,
        numItems: false
    };

    amountTypeOptions = [
        {
            label: '%',
            value: 'percent'
        },
        {
            label: '$',
            value: 'dollar'
        }
    ];

    tagSelectOptions: Select2Options;

    selectedTagIdsSource: Subject<string[]> = new Subject();

    @didSet(didSetSelectedTagIds) selectedTagIds: string[] = [];

    constructor(injector: Injector, private loyaltyRewardService: LoyaltyRewardService, private tagService: TagService, private storeService: StoreService){
        super(injector, loyaltyRewardService);
    }

    ngOnInit(){
        super.ngOnInit();

        this.storeService.currentStoreEmitted.subscribe( store => {
            this.objectObservable.subscribe( object => {
                CommonAdapter(this.tagService, 'id', 'value', {storeId: store.id})
                .then(TagAdapter => {
                    let tagSelectOptions = {
                        ajax: {},
                        multiple: true
                    };
                    tagSelectOptions['dataAdapter'] = TagAdapter;

                    this.tagSelectOptions = tagSelectOptions;

                    console.log(object.Tags)
                    if(object.Tags){
                        this.selectedTagIds = object.Tags.map(tag => tag.id);
                    }else{
                        this.selectedTagIds = [];
                    }

                })
            })
        });

        this.selectedTagIdsSource
            .switchMap((ids) => {
                return ids.length ? Observable.combineLatest(ids.map(id => this.tagService.get(id))) : Observable.of([]);
            })
            .subscribe(tags => {
                this.object.Tags = tags;
                console.log(this.object);
            })
    }

    toggleChanged(){
        if(this.object.appliesTo == 'product'){
            this.object.discountAmount = 100;
            this.object.discountAmountType = 'percent';
        }else{
            this.object.discountAmount = 0;
            this.object.discountAmountType = 'percent';
        }
    }

    clearErrorFlags(){
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        });
    }

    edit(){
        this.loyaltyRewardService.edit(this.object);
    }

    save(){

        let errors = [];
        this.clearErrorFlags();

        if(!this.object.name){
            errors.push("Name cannot be blank.");
            this.errorFlags.name = true;
        }

        if(this.object.points < 0){
            errors.push('Points cannot be negative.');
            this.errorFlags.points = true;
        }

        if(this.object.discountAmount <= 0){
            errors.push("Discount Amount must be positive");
            this.errorFlags.discountAmount = true;
        }

        if(this.object.appliesTo == 'product' && (!this.object.Tags || !this.object.Tags.length)){
            errors.push("Tags cannot be empty if reward is for free products");
            this.errorFlags.tags = true;
        }

        if(this.object.appliesTo == 'product' && this.object.numItems <= 0){
            errors.push("Number of free items cannot be 0 or negative");
            this.errorFlags.numItems = true;
        }

        if(errors.length){
            this.errors = errors;
            return;
        }

        this.loyaltyRewardService.save(this.object);

    }

    remove(){
        this.loyaltyRewardService.remove(this.object);
    }

    cancel(){
        this.loyaltyRewardService.list();
    }


}
