import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {ReportsRoutingModule} from "./reports-routing.module";
import {InventoryIndexComponent} from "./inventory-index/inventory-index.component";
import {InventoryBreakdownComponent} from "./inventory-breakdown/inventory-breakdown.component";
import {InventoryDailyComponent} from "./inventory-daily/inventory-daily.component";
import {SalesIndexComponent} from "./sales-index/sales-index.component";
import {SalesByProductTypeComponent} from "./sales-by-product-type/sales-by-product-type.component";
import {SalesByProductComponent} from "./sales-by-product/sales-by-product.component";
import {SalesByPatientComponent} from "./sales-by-patient/sales-by-patient.component";
import {SalesByEmployeeComponent} from "./sales-by-employee/sales-by-employee.component";
import {SalesByDayComponent} from "./sales-by-day/sales-by-day.component";
import {SalesPeakComponent} from "./sales-peak/sales-peak.component";
import {SalesBreakdownComponent} from "./sales-breakdown/sales-breakdown.component";

import {SalesByTimerComponent} from './sales-by-timer/sales-by-timer.component';

import {BestsellingProductTypesComponent} from "./bestselling-product-types/bestselling-product-types.component";
import {BestsellingProductsComponent} from "./bestselling-products/bestselling-products.component";
import {BestsellingBrandsComponent} from "./bestselling-brands/bestselling-brands.component";
import {DiscountsIndexComponent} from "./discounts-index/discounts-index.component";
import {DiscountsByTypeComponent} from "./discounts-by-type/discounts-by-type.component";
import {DiscountsByEmployeeComponent} from "./discounts-by-employee/discounts-by-employee.component";
import {DiscountsByProductComponent} from "./discounts-by-product/discounts-by-product.component";
import {DiscountsByProductTypeComponent} from "./discounts-by-product-type/discounts-by-product-type.component";
import {InboundTransfersComponent} from "./inbound-transfers/inbound-transfers.component";
import {DrawerBreakdownComponent} from "./drawer-breakdown/drawer-breakdown.component";
import {ReportsComponent} from "./reports.component";
import {MdButtonModule} from "@angular/material";
import {UtilModule} from "../../util/util.module";
import {WholesalePurchaseAdjustmentComponent} from "./wholesale-purchase-adjustment/wholesale-purchase-adjustment.component";
import {ModalsModule} from "../../modals/modals.module";

import {TransactionService} from "../../services/transaction.service";
import {InventoryPackageComponent} from "./inventory-package/inventory-package.component";
import {InventoryNonTHCPOComponent} from "./inventory-non-thc-po/inventory-non-thc-po.component";
import {TaxesIndexComponent} from "./taxes-index/taxes-index.component";
import {PatientsIndexComponent} from "./patients-index/patients-index.component";
import {TimeClocksIndexComponent} from "./time-clocks-index/time-clocks-index.component";

import {OwlDateTimeModule,OwlNativeDateTimeModule} from 'ng4-pick-datetime';

@NgModule({
    imports: [
        CommonModule,
        ReportsRoutingModule,

        OwlDateTimeModule,
        OwlNativeDateTimeModule,

        MdButtonModule,

        UtilModule,
        ModalsModule,
    ],
    declarations: [InventoryIndexComponent, InventoryBreakdownComponent, InventoryDailyComponent, SalesIndexComponent, SalesByProductTypeComponent, SalesByProductComponent, SalesByPatientComponent, SalesByEmployeeComponent, SalesByDayComponent, SalesBreakdownComponent, BestsellingProductTypesComponent, BestsellingProductsComponent, BestsellingBrandsComponent, DiscountsIndexComponent, DiscountsByTypeComponent, ReportsComponent, DiscountsByEmployeeComponent,
        InboundTransfersComponent, SalesPeakComponent, InventoryPackageComponent, InventoryNonTHCPOComponent, TaxesIndexComponent, PatientsIndexComponent, WholesalePurchaseAdjustmentComponent, DiscountsByProductComponent, DiscountsByProductTypeComponent, TimeClocksIndexComponent, DrawerBreakdownComponent, SalesByTimerComponent ],
    providers: [

    ]
})
export class ReportsModule {
}
