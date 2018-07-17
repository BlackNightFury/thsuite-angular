import {Component, Injector, OnInit} from "@angular/core";
import {ILoyaltyReward} from "../../../models/interfaces/loyalty-reward.interface";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {LoyaltyRewardService} from "../../../services/loyalty-reward.service";
import {LoyaltyReward} from "../../../models/loyalty-reward.model";

@Component({
    selector: 'app-loyalty-rewards-index',
    templateUrl: 'loyalty-rewards-index.component.html',
})
export class LoyaltyRewardsIndexComponent extends ObjectsIndexComponent<ILoyaltyReward> implements OnInit {

    constructor(injector: Injector, private loyaltyRewardService: LoyaltyRewardService) {
        super(injector, loyaltyRewardService);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    onRowClick(event, object: ILoyaltyReward){
        if ($(event.target).is('i')) {
            return;
        }

        this.viewLoyaltyReward(object);


    }

    toggleActive(loyaltyReward: ILoyaltyReward, isChecked: boolean) {
        let newLoyaltyReward = new LoyaltyReward(loyaltyReward);
        newLoyaltyReward.isActive = isChecked;

        this.loyaltyRewardService.save(newLoyaltyReward);
    }

    createNewLoyaltyReward(){
        this.loyaltyRewardService.create();
    }

    viewLoyaltyReward(loyaltyReward: ILoyaltyReward){
        this.loyaltyRewardService.view(loyaltyReward);
    }

    editLoyaltyReward(loyaltyReward: ILoyaltyReward){
        this.loyaltyRewardService.edit(loyaltyReward);
    }

    listLoyaltyRewards(){
        this.loyaltyRewardService.list();
    }
}
