import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {AdminRoutingModule} from "./admin-routing.module";
import {AdminComponent} from "./admin.component";
import {LeftNavComponent} from "./left-nav/left-nav.component";
import {TopNavComponent} from "./top-nav/top-nav.component";
import {EmployeesModule} from "./employees/employees.module";
import {ReportsModule} from "./reports/reports.module";
import {StoreModule} from "./store/store.module";
import {InventoryModule} from "./inventory/inventory.module";
import {HomeModule} from "./home/home.module";
import {TestModule} from "./test/test.module";
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {AccountModule} from "../account/account.module";
import { PosModule } from "../pos/pos.module";

@NgModule({
    imports: [
        CommonModule,

        FormsModule,

        AdminRoutingModule,

        UtilModule,
        HomeModule,
        TestModule,
        InventoryModule,
        StoreModule,
        ReportsModule,
        EmployeesModule,
        AccountModule,
        PosModule
    ],
    declarations: [
        AdminComponent,
        TopNavComponent,
        LeftNavComponent
    ]
})
export class AdminModule {
}
