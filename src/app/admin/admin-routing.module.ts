import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {AdminComponent} from "./admin.component";
import {InventoryAuthGuard} from "../util/guards/inventory-auth-guard.service";
import {EmployeesAuthGuard} from "../util/guards/employees-auth-guard.service";
import {StoreAuthGuard} from "../util/guards/store-auth-guard.service";
import {ReportsAuthGuard} from "../util/guards/reports-auth-guard.service";
import {DebugAuthGuard} from "../util/guards/debug-auth-guard.service";
import {PatientsAuthGuard} from "../util/guards/patients-auth-guard.service";
import {AccountComponent} from "../account/account.component";

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/admin/home'
            },
            {
                path: 'account',
                component: AccountComponent
            },
            {
                path: 'home',
                loadChildren: './home/home.module.ts#HomeModule'
            },
            {
                path: 'patients',
                loadChildren: './patients/patients.module.ts#PatientsModule',
                canLoad: [PatientsAuthGuard],
                canActivate: [PatientsAuthGuard]
            },
            {
                path: 'inventory',
                loadChildren: './inventory/inventory.module.ts#InventoryModule',
                canLoad: [InventoryAuthGuard],
                canActivate: [InventoryAuthGuard]
            },
            {
                path: 'employees',
                loadChildren: './employees/employees.module.ts#EmployeesModule',
                canLoad: [EmployeesAuthGuard],
                canActivate: [EmployeesAuthGuard]
            },
            {
                path: 'store',
                loadChildren: './store/store.module.ts#StoreModule',
                canLoad: [StoreAuthGuard],
                canActivate: [StoreAuthGuard]
            },
            {
                path: 'reports',
                loadChildren: './reports/reports.module.ts#ReportsModule',
                canLoad: [ReportsAuthGuard],
                canActivate: [ReportsAuthGuard]
            },
            {
                path: 'test',
                loadChildren: './test/test.module.ts#TestModule',
                canLoad: [DebugAuthGuard],
                canActivate: [DebugAuthGuard]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule {
}
