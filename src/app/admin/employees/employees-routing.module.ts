import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {EmployeesComponent} from "./employees.component";
import {EmployeesIndexComponent} from "./employees-index/employees-index.component";
import {AddEditViewEmployeeComponent} from "./employees-index/add-edit-view-employee/add-edit-view-employee.component";
import {PermissionsIndexComponent} from "./employees-index/add-edit-view-employee/permissions-index/permissions-index.component";

const routes: Routes = [
    {
        path: '',
        component: EmployeesComponent,
        data: {sectionTitle: 'Employee Management'},
        children: [
            {
                path: '',
                component: EmployeesIndexComponent,
                data: {
                    mode: 'employees'
                },
                children: [
                    {
                        path: 'add',
                        component: AddEditViewEmployeeComponent,
                        data: {
                            mode: 'add'
                        }
                    },
                    {
                        path: 'edit/:id',
                        component: AddEditViewEmployeeComponent,
                        data: {
                            mode: 'edit'
                        },
                        children: [
                            {
                                path: 'permissions',
                                component: PermissionsIndexComponent
                            }
                        ]
                    },
                    {
                        path: 'view/:id',
                        component: AddEditViewEmployeeComponent,
                        data: {
                            mode: 'view'
                        }
                    }
                ]
            },
        ]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeesRoutingModule {
}
