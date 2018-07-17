import {Component, Injector, OnInit} from "@angular/core";
import {DiscountService} from "../../../services/discount.service";
import {ProductService} from "../../../services/product.service";
import {ProductTypeService} from  "../../../services/product-type.service";
import {PackageService} from "../../../services/package.service";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {IDiscount} from "../../../models/interfaces/discount.interface";
import {Discount} from "../../../models/discount.model";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {ActivatedRoute, Router} from "@angular/router";
import {UserService} from "../../../services/user.service";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {IPatient} from "../../../models/interfaces/patient.interface";
import {PatientService} from "../../../services/patient.service";
import {IPatientGroup} from "../../../models/interfaces/patient-group.interface";
import {PatientGroupService} from "../../../services/patient-group.service";


declare const $;

@Component({
    selector: 'app-patient-groups-index',
    templateUrl: './patient-groups-index.component.html',
})
export class PatientGroupsIndexComponent extends ObjectsIndexComponent<IPatientGroup> implements OnInit {

    constructor(injector: Injector, private patientGroupService: PatientGroupService) {
        super(injector, patientGroupService);
    }

    ngOnInit() {
        super.ngOnInit();

    }

    onRowClick(event, patient: IPatientGroup) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewPatientGroup(patient);

    }

    createNewPatientGroup() {
        this.patientGroupService.create();
    }
    editPatientGroup(discount: IPatientGroup) {
        this.patientGroupService.edit(discount);
    }
    viewPatientGroup(discount: IPatientGroup) {
        this.patientGroupService.view(discount);
    }

    listPatientGroups() {
        this.patientGroupService.list()
    }
}
