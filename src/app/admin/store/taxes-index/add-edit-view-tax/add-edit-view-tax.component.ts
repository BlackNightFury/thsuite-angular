import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {ITax} from "app/models/interfaces/tax.interface";
import {Component, ElementRef, Injector, OnInit, ViewChild} from "@angular/core";
import {TaxService} from "../../../../services/tax.service";
@Component({
    selector: 'app-add-edit-view-tax',
    templateUrl: './add-edit-view-tax.component.html'
})
export class AddEditViewTaxComponent extends AddEditViewObjectComponent<ITax> implements OnInit{
    @ViewChild('root')overlayRoot: ElementRef;

    errors: string[];

    errorFlags: {
        name: boolean;
        percent: boolean;
        neverApplied: boolean;
    } = {
        name: false,
        percent: false,
        neverApplied: false
    };

    oldTaxId: string;

    constructor(injector: Injector, private taxService: TaxService){
        super(injector, taxService);
    }

    ngOnInit(){
        super.ngOnInit();

        this.route.queryParams.subscribe(params => {

            //All four need to be there
            if(params.name && params.percent && params.appliesToCannabis && params.appliesToNonCannabis && params.oldId){
                this.object.name = params.name;
                this.object.percent = params.percent;
                this.object.appliesToCannabis = params.appliesToCannabis == 'true';
                this.object.appliesToNonCannabis = params.appliesToNonCannabis == 'true';
                this.oldTaxId = params.oldId;
            }

            console.log(this.object);

        });

    }

    resetErrorFlags(){
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    cancel(){
        this.taxService.list();
    }

    edit(){
        this.taxService.edit(this.object);
    }

    save(){

        let errors = [];
        this.resetErrorFlags();

        if(!this.object.name){
            errors.push("Tax name cannot be blank.");
            this.errorFlags.name = true;
        }

        if(this.object.percent <= 0){
            errors.push("Tax percent must be greater than 0");
            this.errorFlags.percent = true;
        }

        if(!this.object.appliesToCannabis && !this.object.appliesToNonCannabis){
            errors.push("This tax will never be applied.");
            this.errorFlags.neverApplied = true;
        }

        if(errors.length){
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        if(this.oldTaxId){
            this.taxService.removeById(this.oldTaxId);
        }

        this.taxService.save(this.object);


    }

}
