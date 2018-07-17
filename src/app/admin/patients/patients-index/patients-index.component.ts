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
import {SortBy} from "../../../util/directives/sort-table-header.directive";

import {PatientGroupService} from "../../../services/patient-group.service";
import {didSet} from "../../../lib/decorators/property/didSet";
import {PreviousRouteService} from '../../../services/previous-route.service';


declare const $;

export function didSetPatientGroupId(newValue){
    this.selectedPatientGroupIdSource.next(newValue);
}

@Component({
    selector: 'app-patients-index',
    templateUrl: './patients-index.component.html',
})

export class PatientsIndexComponent extends ObjectsIndexComponent<IPatient> implements OnInit {

    selectedPatientGroupIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);
    patientGroupSelect2Options: Select2Options;

    @didSet(didSetPatientGroupId) selectedPatientGroupId: string;

    isPreviousPurchasesModalShowing: boolean = false;

    constructor(injector: Injector,
                private patientService: PatientService,
                private PatientGroupService: PatientGroupService,
                private previousRouteService: PreviousRouteService) {
        super(injector, patientService);
    }

    ngOnInit() {
        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/patients/patient-index");

        this.sortByModel = new SortBy("lastName", "asc");
        super.ngOnInit();

        this.patientService.previousPurchasesModalShowing.subscribe(val => {
            this.isPreviousPurchasesModalShowing = val;
        });

        CommonAdapter(this.PatientGroupService, 'id', 'name')
            .then(PatientGroupAdapter => {
                this.patientGroupSelect2Options = {
                    ajax: {},
                    placeholder: "Patient Group",
                    allowClear: true,
                    dropdownCssClass: 'compact'
            };
                this.patientGroupSelect2Options['dataAdapter'] = PatientGroupAdapter;
            });

        this.selectedPatientGroupIdSource.asObservable().subscribe(patientGroupId => {
            this.extraFilters.next({patientGroupId: patientGroupId});
            console.log(patientGroupId);
        });

        this.prepareSearch(navigationFromChild);
    }


    prepareSearch(rememberSearchPosition:boolean){
        if(!rememberSearchPosition) {
            this.selectedPatientGroupId = '';
        }
        this.selectedPatientGroupIdSource.next(this.selectedPatientGroupId);
    }

    onRowClick(event, patient: IPatient) {
        if ($(event.target).is('i')) {
            return;
        }

        this.viewPatient(patient);
    }

    createNewPatient() {
        this.patientService.create();
    }
    editPatient(discount: IPatient) {
        this.patientService.edit(discount);
    }
    viewPatient(discount: IPatient) {
        this.patientService.view(discount);
    }

    listPatients() {
        this.patientService.list()
    }

    exportPatients() {
        this.patientService.exportPatients().then((url) => {
            var iframe = $("<iframe/>").attr({
                src: url.Location,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");
        });
    }
}
