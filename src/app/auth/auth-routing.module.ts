import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {LoginComponent} from "./login/login.component";
import {ForgotComponent} from "./forgot/forgot.component";
import {ActivateComponent} from "app/auth/activate/activate.component";
import {ResetPasswordComponent} from "./reset-password/reset-password.component";
import {EmailSentComponent} from "./email-sent/email-sent.component";
import {RegisterPosDeviceComponent} from "./register-pos-device/register-pos-device.component";

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'forgot',
        component: ForgotComponent
    },
    {
        path: 'email-sent',
        component: EmailSentComponent
    },
    {
        path: 'activate/:activate',
        component: ActivateComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'register-device',
        component: RegisterPosDeviceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {
}
