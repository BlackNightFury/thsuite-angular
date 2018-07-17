import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HelpRoutingModule} from "./help-routing.module";
import {HelpComponent} from "./help.component";
import {UtilModule} from "../util/util.module";
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HelpRoutingModule,
        UtilModule
    ],
    declarations: [HelpComponent]
})
export class HelpModule {
}
