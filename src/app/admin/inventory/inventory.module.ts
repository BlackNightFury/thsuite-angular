import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MdStepperModule} from "@angular/material";

import {InventoryRoutingModule} from "./inventory-routing.module";
import {ProductsIndexComponent} from "./products-index/products-index.component";
import {InventoryComponent} from "./inventory.component";
import {ProductTypesIndexComponent} from "./product-types-index/product-types-index.component";
import {SuppliersIndexComponent} from "./suppliers-index/suppliers-index.component";
import {IncomingIndexComponent} from "./incoming-index/incoming-index.component";
import {OutgoingIndexComponent} from "./outgoing-index/outgoing-index.component";
import {UtilModule} from "../../util/util.module";
import {FormsModule} from "@angular/forms";
import {AddEditViewSupplierComponent} from "./suppliers-index/add-edit-view-supplier/add-edit-view-supplier.component";
import {AddEditViewProductTypeComponent} from "./product-types-index/add-edit-view-product-type/add-edit-view-product-type.component";
import {ItemsIndexComponent} from "./items-index/items-index.component";
import {AddEditViewVariationComponent} from "./products-index/add-edit-view-product/variations-index/add-edit-view-variation/add-edit-view-variation.component";
import {VariationsIndexComponent} from "./products-index/add-edit-view-product/variations-index/variations-index.component";
import {AddEditViewProductComponent} from "./products-index/add-edit-view-product/add-edit-view-product.component";
import {AddEditViewItemComponent} from "./items-index/add-edit-view-item/add-edit-view-item.component";
import {PackagesIndexComponent} from "./items-index/add-edit-view-item/packages-index/packages-index.component";
import {AddEditViewPackageComponent} from "./items-index/add-edit-view-item/packages-index/add-edit-view-package/add-edit-view-package.component";
import {AddEditViewIncomingComponent} from "./incoming-index/add-edit-view-incoming/add-edit-view-incoming.component";
import {IncomingPackagesIndexComponent} from "./incoming-index/add-edit-view-incoming/incoming-packages-index/incoming-packages-index.component";
import {ViewPackageComponent} from "./incoming-index/add-edit-view-incoming/incoming-packages-index/view-package/view-package.component";
import {AddEditViewOutgoingComponent} from "./outgoing-index/add-edit-view-outgoing/add-edit-view-outgoing.component";
import {OutgoingPackagesIndexComponent} from "./outgoing-index/add-edit-view-outgoing/outgoing-packages-index/outgoing-packages-index.component";
import {BarcodesIndexComponent} from "./barcodes-index/barcodes-index.component";
import {AddEditViewBarcodeComponent} from "./add-edit-view-barcode/add-edit-view-barcode.component";
import {AddEditViewAllocationComponent} from "./add-edit-view-barcode/add-edit-view-allocation/add-edit-view-allocation.component";
import {PricingTiersIndexComponent} from "./pricing-tiers-index/pricing-tiers-index.component";
import {AddEditViewPricingTierComponent} from "./pricing-tiers-index/add-edit-view-pricing-tier/add-edit-view-pricing-tier.component";
import {ScaleAllocationComponent} from "./add-edit-view-barcode/add-edit-view-allocation/scale-allocation/scale-allocation.component";
import {AlertsComponent} from "./alerts/alerts.component";
import {PackagesComponent} from "./packages/packages.component";
import {PackageDetailsComponent} from "./packages/package-details/package-details.component";
import {PackageConversionComponent} from "./packages/package-conversion/package-conversion.component";
import {UploadPackageIdsModalComponent} from "./packages/upload-package-ids-modal/upload-package-ids-modal.component";
import {ModalsModule} from "../../modals/modals.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        InventoryRoutingModule,
        MdStepperModule,
        UtilModule,
        ModalsModule
    ],
    declarations: [
        InventoryComponent,

        ProductsIndexComponent,
        AddEditViewProductComponent,

        ProductTypesIndexComponent,
        AddEditViewProductTypeComponent,

        SuppliersIndexComponent,
        AddEditViewSupplierComponent,

        IncomingIndexComponent,
        AddEditViewIncomingComponent,

        OutgoingIndexComponent,
        AddEditViewOutgoingComponent,

        ItemsIndexComponent,
        AddEditViewItemComponent,

        VariationsIndexComponent,
        AddEditViewVariationComponent,

        PackagesIndexComponent,
        AddEditViewPackageComponent,

        IncomingPackagesIndexComponent,
        ViewPackageComponent,

        OutgoingPackagesIndexComponent,

        BarcodesIndexComponent,
        AddEditViewBarcodeComponent,
        AddEditViewAllocationComponent,
        ScaleAllocationComponent,

        PricingTiersIndexComponent,
        AddEditViewPricingTierComponent,

        AlertsComponent,
        PackagesComponent,
        PackageDetailsComponent,
        PackageConversionComponent,

        UploadPackageIdsModalComponent
    ]
})
export class InventoryModule {
}
