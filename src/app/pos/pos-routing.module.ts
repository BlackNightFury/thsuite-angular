import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {PosComponent} from "./pos.component";
import {PosListComponent} from "./pos-list/pos-list.component";
import {PosReceiptComponent} from "./pos-receipt/pos-receipt.component";
import {AddEditViewPosReceiptComponent} from "./pos-receipt/add-edit-view-receipt/add-edit-view-receipt.component";
import {PosSettingsDashboardComponent} from "./pos-settings-dashboard/pos-settings-dashboard.component";
import {PosDrawerComponent} from "./pos-drawer/pos-drawer.component";
import {PosSettingsComponent} from "./pos-settings/pos-settings.component";
import {PosTimeClockComponent} from "./pos-time-clock/pos-time-clock.component";
import {PosListDrawerGuard} from "../util/guards/pos-list-drawer-guard.service";
import {PosDrawerClosingReportComponent} from "./pos-drawer/closing-report/pos-drawer-closing-report.component";
import {PosInventoryComponent} from "./pos-inventory/pos-inventory.component";

const routes: Routes = [
    {
        path: '',
        component: PosComponent,
        children: [
            {
                path: 'settings',
                component: PosSettingsDashboardComponent,
                children: [
                    {
                        component: PosReceiptComponent,
                        path: 'receipts',
                        children: [
                            {
                                component: AddEditViewPosReceiptComponent,
                                path: 'view/:id',
                                data: {
                                    mode: 'view'
                                }
                            }
                        ]
                    },
                    {
                        component: PosInventoryComponent,
                        path: 'inventory'
                    },
                    {
                        component: PosDrawerComponent,
                        path: 'drawer'
                    },
                    {
                        path: 'time-clock',
                        component: PosTimeClockComponent
                    },
                    {
                        component: PosSettingsComponent,
                        path: 'settings'
                    },
                    {
                        component: PosDrawerClosingReportComponent,
                        path: 'drawer-closing-report'
                    },
                ]
            },
            {
                path: ':cannabisCategory',
                component: PosListComponent,
                canActivate: [PosListDrawerGuard]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PosRoutingModule {
}
