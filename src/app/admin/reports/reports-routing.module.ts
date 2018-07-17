import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {ReportsComponent} from "./reports.component";
import {InventoryIndexComponent} from "./inventory-index/inventory-index.component";
import {InventoryBreakdownComponent} from "./inventory-breakdown/inventory-breakdown.component";
import {InventoryDailyComponent} from "./inventory-daily/inventory-daily.component";
import {SalesIndexComponent} from "./sales-index/sales-index.component";
import {SalesByProductTypeComponent} from "./sales-by-product-type/sales-by-product-type.component";
import {SalesByProductComponent} from "./sales-by-product/sales-by-product.component";
import {SalesByPatientComponent} from "./sales-by-patient/sales-by-patient.component";
import {SalesByEmployeeComponent} from "./sales-by-employee/sales-by-employee.component";
import {SalesByDayComponent} from "./sales-by-day/sales-by-day.component";
import {SalesBreakdownComponent} from "./sales-breakdown/sales-breakdown.component";

import {SalesByTimerComponent} from "./sales-by-timer/sales-by-timer.component";

import {SalesPeakComponent} from "./sales-peak/sales-peak.component";
import {BestsellingProductTypesComponent} from "./bestselling-product-types/bestselling-product-types.component";
import {BestsellingProductsComponent} from "./bestselling-products/bestselling-products.component";
import {BestsellingBrandsComponent} from "./bestselling-brands/bestselling-brands.component";
import {DiscountsIndexComponent} from "./discounts-index/discounts-index.component";
import {DiscountsByEmployeeComponent} from "./discounts-by-employee/discounts-by-employee.component";
import {InboundTransfersComponent} from "./inbound-transfers/inbound-transfers.component";
import {DiscountsByTypeComponent} from "./discounts-by-type/discounts-by-type.component";
import {DiscountsByProductComponent} from "./discounts-by-product/discounts-by-product.component";
import {DiscountsByProductTypeComponent} from "./discounts-by-product-type/discounts-by-product-type.component";
import {InventoryPackageComponent} from "./inventory-package/inventory-package.component";
import {InventoryNonTHCPOComponent} from "./inventory-non-thc-po/inventory-non-thc-po.component";
import {TaxesIndexComponent} from "./taxes-index/taxes-index.component";
import {PatientsIndexComponent} from "./patients-index/patients-index.component";
import {WholesalePurchaseAdjustmentComponent} from "./wholesale-purchase-adjustment/wholesale-purchase-adjustment.component";
import {TimeClocksIndexComponent} from "./time-clocks-index/time-clocks-index.component";
import {DrawerBreakdownComponent} from "./drawer-breakdown/drawer-breakdown.component";


const routes: Routes = [
    {
        path: '',
        component: ReportsComponent,
        data: {sectionTitle: 'Reports'},
        children: [
            {
                path: '',
                redirectTo: 'index',
                pathMatch: 'full'
            },
            {
                path: 'inventory',
                component: InventoryIndexComponent,
                data: {
                    mode: 'inventory'
                }
            },
            {
                path: 'index',
                component: SalesIndexComponent,
                data: {
                    mode: 'index'
                }
            },
            {
                path: 'product-type',
                component: SalesByProductTypeComponent,
                data: {
                    mode: 'product-type'
                }
            },
            {
                path: 'product',
                component: SalesByProductComponent,
                data: {
                    mode: 'product'
                }
            },
            {
                path: 'patient',
                component: SalesByPatientComponent,
                data: {
                    mode: 'patient'
                }
            },
            {
                path: 'employee',
                component: SalesByEmployeeComponent,
                data: {
                    mode: 'employee'
                }
            },
            {
                path: 'peak-sales',
                component: SalesPeakComponent,
                data:{
                    mode: 'peak-sales'
                }
            },
            {
                path: 'daily',
                component: SalesByDayComponent,
                data:{
                    mode: 'daily'
                }
            },
            {
                path: 'transaction-time',
                component: SalesByTimerComponent,
                data: {
                    mode: 'transaction-time'
                }
            },
            {
                path: 'top-product-types',
                component: BestsellingProductTypesComponent,
                data: {
                    mode: 'top-products-types'
                }
            },
            {
                path: 'top-products',
                component: BestsellingProductsComponent,
                data: {
                    mode: 'top-products'
                }
            },
            {
                path: 'top-brands',
                component: BestsellingBrandsComponent,
                data: {
                    mode: 'top-brands'
                }
            },
            {
                path: 'discounts-index',
                component: DiscountsIndexComponent,
                data: {
                    mode: 'discounts-index'
                }
            },
            {
                path: 'discounts-by-type',
                component: DiscountsByTypeComponent,
                data: {
                    mode: 'discounts-type'
                }
            },
            {
                path: 'discounts-by-employee',
                component: DiscountsByEmployeeComponent,
                data: {
                    mode: 'discounts-employee'
                }
            },
            {
                path: 'discounts-by-product',
                component: DiscountsByProductComponent,
                data: {
                    mode: 'discounts-product'
                }
            },
            {
                path: 'discounts-by-product-type',
                component: DiscountsByProductTypeComponent,
                data: {
                    mode: 'discounts-product-type'
                }
            },
            {
                path: 'inbound-transfers',
                component: InboundTransfersComponent,
                data: {
                    mode: 'inbound-transfers'
                }
            },
            {
                path: 'sales-breakdown',
                component: SalesBreakdownComponent,
                data: {
                    mode: 'sales-breakdown'
                }
            },
            {
                path: 'patients-index',
                component: PatientsIndexComponent,
                data: {
                    mode: 'patients-index'
                }
            },
            {
                path: 'drawer-breakdown',
                component: DrawerBreakdownComponent,
                data:{
                    mode: 'drawer-breakdown'
                }

            },
            {
                path: 'inventory-breakdown',
                component: InventoryBreakdownComponent,
                data: {
                    mode: 'inventory-breakdown'
                }
            },
            {
                path: 'inventory-daily',
                component: InventoryDailyComponent,
                data: {
                    mode: 'inventory-daily'
                }
            },
            {
                path: 'inventory-package',
                component: InventoryPackageComponent,
                data: {
                    mode: 'inventory-package'
                }
            },
            {
                path: 'inventory-non-thc-po',
                component: InventoryNonTHCPOComponent,
                data: {
                    mode: 'inventory-non-thc-po'
                }
            },
            {
                path: 'taxes-index',
                component: TaxesIndexComponent,
                data: {
                    mode: 'taxes-index'
                }
            },
            {
                path: 'wholesale-purchase-adjustment',
                component: WholesalePurchaseAdjustmentComponent,
                data: {
                    mode: 'wholesale-purchase-adjustment'
                }
            },
            {
                path: 'time-clocks-index',
                component: TimeClocksIndexComponent,
                data: {
                    mode: 'time-clocks-index'
                }
            },


        ]
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}
