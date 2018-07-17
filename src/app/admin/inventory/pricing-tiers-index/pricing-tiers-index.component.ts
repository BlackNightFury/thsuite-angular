import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {PricingTierService} from "../../../services/pricing-tier.service";
import {Component, Injector, OnInit} from "@angular/core";
import {IPricingTier} from "../../../models/interfaces/pricing-tier.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";

@Component({
    selector: 'app-pricing-tiers-index',
    templateUrl: './pricing-tiers-index.component.html'
})
export class PricingTiersIndexComponent extends ObjectsIndexComponent<IPricingTier> implements OnInit{

    modeDisplayNames = {
        'mix-match': "Mix and Match",
        'matching-only': "Matching Products Only",
        'each': "Each"
    };

    constructor(injector: Injector, private pricingTierService: PricingTierService){
        super(injector, pricingTierService);
    }

    ngOnInit(){
        super.ngOnInit();

        this.sortBy.next( new SortBy( 'createdAt', 'desc' ) )
    }

    onRowClick(event, tier){
        if($(event.target).is('i')) {
            return;
        }

        this.viewTier(tier);
    }

    createTier(){
        this.pricingTierService.create();
    }

    viewTier(tier: IPricingTier){
        this.pricingTierService.view(tier);

    }

    editTier(tier: IPricingTier){
        this.pricingTierService.edit(tier);
    }

    listTiers(){
        this.pricingTierService.list();
    }
}
