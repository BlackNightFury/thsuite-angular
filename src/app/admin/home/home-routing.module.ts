import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {HomeComponent} from "./home.component";
import {RegisterPosDeviceComponent} from "./register-pos-device/register-pos-device.component";

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        data: {sectionTitle: 'Home'}
    },
    {
        path: 'register-pos',
        component: RegisterPosDeviceComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule {
}
