import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {AuthRoutingModule} from "./auth-routing.module";
import {LoginComponent} from "./login/login.component";
import {UtilModule} from "../util/util.module";
import {ForgotComponent} from "./forgot/forgot.component";
import {ActivateComponent} from "./activate/activate.component";
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {EmailSentComponent} from "app/auth/email-sent/email-sent.component";
import {RegisterPosDeviceComponent} from "./register-pos-device/register-pos-device.component";

@NgModule({
    imports: [
        CommonModule,
        UtilModule,
        AuthRoutingModule
    ],
    declarations: [
        LoginComponent,
        ForgotComponent,
        EmailSentComponent,
        ActivateComponent,
        ResetPasswordComponent,
        RegisterPosDeviceComponent
    ],
})
export class AuthModule {
}
