import {Component, Injector, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {Observable} from "rxjs";
import {IDiscount} from "../../../../models/interfaces/discount.interface";
import {DiscountService} from "../../../../services/discount.service";
import {Discount} from "../../../../models/discount.model";
import {ProductTypeService} from "../../../../services/product-type.service";
import {IProductType} from "../../../../models/interfaces/product-type.interface";
import {ActivatedRoute} from "@angular/router";
import {CommonAdapter} from "../../../../util/select2-adapters/common-adapter";
import {PackageService} from "../../../../services/package.service";
import {ProductService} from "../../../../services/product.service";
import {AddEditViewObjectComponent} from "../../../../util/add-edit-view-object.component";
import {PatientGroupService} from "../../../../services/patient-group.service";
import {PatientService} from "../../../../services/patient.service";
import {IPatient} from "../../../../models/interfaces/patient.interface";
import {IPatientGroup} from "../../../../models/interfaces/patient-group.interface";
import {Patient} from "../../../../models/patient.model";

@Component({
    selector: 'app-add-edit-view-patient-group',
    templateUrl: './add-edit-view-patient-group.component.html'
})
export class AddEditViewPatientGroupComponent extends AddEditViewObjectComponent<IPatientGroup> implements OnInit, OnDestroy {
    @ViewChild('root')overlayRoot: ElementRef;

    groupNotEmpty: boolean = false;

    errors: string[];

    errorFlags: any = {
        name: false,
        description: false
    };

    patientGroups: IPatientGroup[];

    constructor(injector: Injector, private patientGroupService: PatientGroupService) {
        super(injector, patientGroupService);
    }

    ngOnInit() {

        super.ngOnInit();

    }


    clearErrorFlags() {
        Object.keys(this.errorFlags).forEach(key => {
            this.errorFlags[key] = false;
        })
    }

    edit() {
        this.patientGroupService.edit(this.object);
    }

    save() {
        this.clearErrorFlags();
        let errors = [];

        if(!this.object.name) {
            errors.push("Name is a required field.");
            this.errorFlags.name = true;
        }

        if(!this.object.description) {
            errors.push("Description is a required field.");
            this.errorFlags.description = true;
        }

        if(errors.length) {
            this.errors = errors;
            this.overlayRoot.nativeElement.scrollTop = 0;
            return;
        }

        this.patientGroupService.save(this.object);
    }

    remove(){
        this.patientGroupService.patientsInGroup(this.object)
            .subscribe(groupNotEmpty => {
                this.groupNotEmpty = groupNotEmpty;

                if(!groupNotEmpty){
                    //Group is empty -- delete
                    this.patientGroupService.remove(this.object);
                }
            })
    }

    cancel() {
        this.patientGroupService.cancelEdit(this.object);
    }

}
