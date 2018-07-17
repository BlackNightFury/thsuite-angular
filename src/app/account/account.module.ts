import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MdCheckboxModule} from "@angular/material";

import {AccountRoutingModule} from "./account-routing.module";
import {AccountComponent} from "./account.component";
import {UtilModule} from "../util/util.module";

@NgModule({
    imports: [
        CommonModule,
        AccountRoutingModule,
        UtilModule,
        MdCheckboxModule
    ],
    declarations: [AccountComponent]
})
export class AccountModule {
}
