import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {EmployeesRoutingModule} from "./employees-routing.module";
import {EmployeesIndexComponent} from "./employees-index/employees-index.component";
import {RolesIndexComponent} from "./roles-index/roles-index.component";
import {TimesheetsIndexComponent} from "./timesheets-index/timesheets-index.component";
import {EmployeesComponent} from "./employees.component";
import {UtilModule} from "../../util/util.module";
import {AddEditViewEmployeeComponent} from "./employees-index/add-edit-view-employee/add-edit-view-employee.component";
import {PermissionsIndexComponent} from "./employees-index/add-edit-view-employee/permissions-index/permissions-index.component";
import { OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng4-pick-datetime';
import {ModalsModule} from "../../modals/modals.module";

@NgModule({
    imports: [
        CommonModule,
        EmployeesRoutingModule,

        OwlDateTimeModule,
        OwlNativeDateTimeModule,

        UtilModule,
        ModalsModule
    ],
    declarations: [EmployeesIndexComponent, PermissionsIndexComponent, RolesIndexComponent, TimesheetsIndexComponent, EmployeesComponent, AddEditViewEmployeeComponent]
})
export class EmployeesModule {
}
