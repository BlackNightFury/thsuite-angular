import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {PricingTierService} from "../../../../services/pricing-tier.service";
import {Component, ElementRef, Injector, OnInit, ViewChild} from "@angular/core";
import {IPricingTier} from "../../../../models/interfaces/pricing-tier.interface";
import {PricingTierWeightService} from "../../../../services/pricing-tier-weight.service";
import {IPricingTierWeight} from "../../../../models/interfaces/pricing-tier-weight.interface";


@Component({
    selector: 'app-add-edit-view-pricing-tier',
    templateUrl: './add-edit-view-pricing-tier.component.html',
    styleUrls: ['./add-edit-view-pricing-tier.component.css']
})
export class AddEditViewPricingTierComponent extends AddEditViewObjectComponent<IPricingTier> implements OnInit{
    @ViewChild('root')overlayRoot: ElementRef;

    errors: string[];
    errorFlags: {
        name: boolean,
        tiers: boolean
    } = {
        name: false,
        tiers: false
    };

    explanationShowing: boolean = false;

    modeDisplayNames = {
        'mix-match': "Mix and Match",
        'matching-only': "Matching Products Only",
        'each': "Each"
    };

    modeOptions = [
        {
            label: "Mix and Match",
            value: 'mix-match'
        },
        {
            label: "Matching Products Only",
            value: "matching-only"
        },
        {
            label: "Each",
            value: 'each'
        }
    ];

    tiersToDelete: string[] = [];

    constructor(injector: Injector, private pricingTierService: PricingTierService, private pricingTierWeightService: PricingTierWeightService){
        super(injector, pricingTierService);
    }

    ngOnInit(){
        super.ngOnInit();

        this.objectObservable.subscribe(object => {
            this.object.PricingTierWeights.forEach( tierWeight => {
                tierWeight.totalPrice = (tierWeight.weight == 0 ? tierWeight.price : tierWeight.price * tierWeight.weight).toFixed(2)
            } )
        });


    }

    addTier(){
        this.clearErrorFlags();
        let tierWeight = this.pricingTierWeightService.newInstance();
        tierWeight.pricingTierId = this.object.id;

        this.object.PricingTierWeights.push(tierWeight);
    }

    deleteTier(tierWeight: IPricingTierWeight){
        this.clearErrorFlags();
        this.tiersToDelete.push(tierWeight.id);
        let oldTierWeights = this.object.PricingTierWeights.slice();
        this.object.PricingTierWeights = [];
        for(let oldTierWeight of oldTierWeights){
            if(oldTierWeight.id != tierWeight.id){
                this.object.PricingTierWeights.push(oldTierWeight);
            }
        }

    }

    toggleExplanation(){
        this.explanationShowing = !this.explanationShowing;
    }

    edit(pricingTier: IPricingTier){
        this.pricingTierService.edit(pricingTier);
    }

    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    save(){
        this.clearErrorFlags();
        let errors = [];
        if(!this.object.name){
            errors.push("Pricing Tier must have a name.");
            this.errorFlags.name = true;
        }


        //Check tiers
        let seenWeights = [];
        for(let tierWeight of this.object.PricingTierWeights){
            //Only check tier if its not in the to delete box
            if(this.tiersToDelete.indexOf(tierWeight.id) === -1) {
                if (tierWeight.weight < 0) {
                    errors.push("Tier weights cannot be negative.");
                    this.errorFlags.tiers = true;
                }

                if (tierWeight.price < 0) {
                    errors.push("Tier prices cannot be negative.");
                    this.errorFlags.tiers = true;
                }

                if (seenWeights.indexOf(tierWeight.weight) !== -1) {
                    errors.push("Tier weights must be unique.");
                    this.errorFlags.tiers = true;
                    break;
                } else {
                    seenWeights.push(tierWeight.weight);
                }
            }
        }

        if(errors.length){
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        //Actually delete deleted tiers
        for(let deletedTierId of this.tiersToDelete){
            this.pricingTierWeightService.deleteTierWeight(deletedTierId);
        }

        //Save pricing tier first
        this.pricingTierService.save(this.object);

        //Save tiers
        for(let toSaveTier of this.object.PricingTierWeights){
            if(this.tiersToDelete.indexOf(toSaveTier.id) === -1) {
                this.pricingTierWeightService.save(toSaveTier);
            }
        }

        this.pricingTierService.view(this.object);

    }

    async remove(){
        let errors = [];
        if(!(await this.pricingTierService.canRemove(this.object))){
            errors.push("Cannot delete pricing tiers that are still associated with products.");
            this.errors = errors;
            return;
        }else{
            this.pricingTierService.remove(this.object);
        }

    }

    cancel(){
        this.pricingTierService.list();
    }

    onTotalPriceUpdate(tierWeight: IPricingTierWeight, totalPrice) {
        tierWeight.price = tierWeight.weight == 0 ? totalPrice : totalPrice / tierWeight.weight
        tierWeight.totalPrice = totalPrice
    }

    onWeightUpdate(tierWeight: IPricingTierWeight, weight) {
        tierWeight.price = weight == 0 ? parseFloat(tierWeight.totalPrice) : parseFloat(tierWeight.totalPrice) / weight
        tierWeight.totalPrice = (weight == 0 ? tierWeight.price : tierWeight.price * weight).toFixed(2)
    }
}
