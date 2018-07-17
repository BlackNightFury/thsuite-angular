import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {PatientsComponent} from "./patients.component";
import {MdButtonModule} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../../util/util.module";
import {PatientsRoutingModule} from "./patients-routing.module";
import {PatientsIndexComponent} from "./patients-index/patients-index.component";
import {AddEditViewPatientComponent} from "./patients-index/add-edit-view-patient/add-edit-view-patient.component";
import {PatientGroupsIndexComponent} from "./patient-groups-index/patient-groups-index.component";
import {AddEditViewPatientGroupComponent} from "./patient-groups-index/add-edit-view-patient/add-edit-view-patient-group.component";
import {CheckInComponent} from "./check-in-index/check-in-index.component";
import {PhysiciansComponent} from "./physicians-index/physicians-index.component";
import {AddEditViewPhysicianComponent} from "./physicians-index/add-edit-view-physician/add-edit-view-physician.component";
import {CheckInModalComponent} from "./check-in-index/check-in-modal/check-in-modal.component";
import {CaregiversIndexComponent} from "./caregivers-index/caregivers-index.component";
import {AddEditViewCaregiverComponent} from "./caregivers-index/add-edit-view-caregiver/add-edit-view-caregiver.component";
import {AddEditViewPatientQueueComponent} from "./check-in-index/add-edit-view-patient-queue/add-edit-view-patient-queue.component";
import {VisitorsIndexComponent} from "./visitors-index/visitors-index.component";
import {AddEditVisitorModalComponent} from "./visitors-index/add-edit-visitor-modal/add-edit-visitor-modal.component";
import {VisitorIdModalComponent} from "./visitors-index/visitor-id-modal/visitor-id-modal.component";
import {VisitorCheckoutModalComponent} from "./visitors-index/visitor-checkout-modal/visitor-checkout-modal.component";
import {VerifyAddModalComponent} from "./check-in-index/add-edit-view-patient-queue/verify-add-modal/verify-add-modal.component";
import {ModalsModule} from "../../modals/modals.module";
import {OwlDateTimeModule,OwlNativeDateTimeModule} from 'ng4-pick-datetime';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        PatientsRoutingModule,

        OwlDateTimeModule,
        OwlNativeDateTimeModule,

        MdButtonModule,

        UtilModule,
        ModalsModule
    ],
    declarations: [

        PatientsComponent,
        PatientsIndexComponent,
        AddEditViewPatientComponent,
        PatientGroupsIndexComponent,
        AddEditViewPatientGroupComponent,
        CheckInComponent,
        CheckInModalComponent,
        AddEditViewPatientQueueComponent,
        VerifyAddModalComponent,
        PhysiciansComponent,
        AddEditViewPhysicianComponent,
        CaregiversIndexComponent,
        AddEditViewCaregiverComponent,
        VisitorsIndexComponent,
        AddEditVisitorModalComponent,
        VisitorIdModalComponent,
        VisitorCheckoutModalComponent
    ]
})
export class PatientsModule {
}
