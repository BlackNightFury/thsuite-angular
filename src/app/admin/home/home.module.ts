import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {HomeRoutingModule} from "./home-routing.module";
import {HomeComponent} from "./home.component";
import {SalesOverTimeComponent} from "./sales-over-time/sales-over-time.component";
import {SalesByProductTypeComponent} from "./sales-by-product-type/sales-by-product-type.component";
import {BestsellingProductsComponent} from "./bestselling-products/bestselling-products.component";
import {BestsellingBrandsComponent} from "./bestselling-brands/bestselling-brands.component";
import {TopPerformingBudtendersComponent} from "./top-performing-budtenders/top-performing-budtenders.component";
import {UtilModule} from "../../util/util.module";
import {RegisterPosDeviceComponent} from "./register-pos-device/register-pos-device.component";

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,

        UtilModule
    ],
    providers: [],
    declarations: [HomeComponent, SalesOverTimeComponent, SalesByProductTypeComponent, BestsellingProductsComponent, BestsellingBrandsComponent, TopPerformingBudtendersComponent, RegisterPosDeviceComponent]
})
export class HomeModule {
}
