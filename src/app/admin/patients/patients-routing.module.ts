import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PatientsIndexComponent} from "./patients-index/patients-index.component";
import {AddEditViewPatientComponent} from "./patients-index/add-edit-view-patient/add-edit-view-patient.component";
import {PatientsComponent} from "./patients.component";
import {PatientGroupsIndexComponent} from "./patient-groups-index/patient-groups-index.component";
import {AddEditViewPatientGroupComponent} from "./patient-groups-index/add-edit-view-patient/add-edit-view-patient-group.component";
import {CheckInComponent} from "./check-in-index/check-in-index.component";
import {PhysiciansComponent} from "./physicians-index/physicians-index.component";
import {AddEditViewPhysicianComponent} from "./physicians-index/add-edit-view-physician/add-edit-view-physician.component";
import {CaregiversIndexComponent} from "./caregivers-index/caregivers-index.component";
import {AddEditViewCaregiverComponent} from "./caregivers-index/add-edit-view-caregiver/add-edit-view-caregiver.component";
import {AddEditViewPatientQueueComponent} from "./check-in-index/add-edit-view-patient-queue/add-edit-view-patient-queue.component";
import {VisitorsIndexComponent} from "./visitors-index/visitors-index.component";
import {AddEditVisitorModalComponent} from "./visitors-index/add-edit-visitor-modal/add-edit-visitor-modal.component";

const routes: Routes = [
    {
        path: '',
        component: PatientsComponent,
        data: {sectionTitle: 'Patient Management'},
        children: [
            {
                path: '',
                redirectTo: 'index',
                pathMatch: 'full'
            },
            {
                path: 'index',
                component: PatientsIndexComponent,
                data: {
                    mode: 'patients'
                },
                children: [
                    {
                        component: AddEditViewPatientComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewPatientComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewPatientComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'patient-groups',
                component: PatientGroupsIndexComponent,
                data: {
                    mode: 'patient-groups'
                },
                children: [
                    {
                        component: AddEditViewPatientGroupComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewPatientGroupComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewPatientGroupComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                component: CheckInComponent,
                path: 'check-in',
                children: [
                    {
                        component: AddEditViewPatientQueueComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                component: PhysiciansComponent,
                path: 'physicians',
                children: [
                    {
                        component: AddEditViewPhysicianComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewPhysicianComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewPhysicianComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                component: CaregiversIndexComponent,
                path: 'caregivers',
                children: [
                    {
                        component: AddEditViewCaregiverComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewCaregiverComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewCaregiverComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                component: VisitorsIndexComponent,
                path: 'visitors'
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PatientsRoutingModule {
}
