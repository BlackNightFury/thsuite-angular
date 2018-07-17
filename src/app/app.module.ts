import {ErrorHandler, Injectable, NgModule} from "@angular/core";
// import {Ng2NotifyService} from 'ng2-notify/notify';

import {AppRoutingModule} from "./app-routing.module";
import {AppComponent} from "./app.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AccountModule} from "./account/account.module";
import {HelpModule} from "./help/help.module";
import {SocketService} from "./lib/socket";
import {UtilModule} from "./util/util.module";
import {CommonModule} from "@angular/common";
import {AdminAuthGuard} from "./util/guards/admin-auth-guard.service";
import {PosAuthGuard} from "./util/guards/pos-auth-guard.service";
import {PosListDrawerGuard} from "./util/guards/pos-list-drawer-guard.service";
import {UserService} from "./services/user.service";
import {PackageService} from "./services/package.service";
import {PackageBarcodeNavigationService} from "./services/package-barcode-navigation.service";
import {ProductService} from "./services/product.service";
import {ProductTypeService} from "./services/product-type.service";
import {StoreService} from "./services/store.service";
import {SupplierService} from "./services/supplier.service";
import {DiscountService} from "./services/discount.service";
import {ItemService} from "./services/item.service";
import {ProductVariationService} from "./services/product-variation.service";
import {PermissionService} from "./services/permission.service";
import {TransferService} from "./services/transfer.service";
import {PatientsAuthGuard} from "./util/guards/patients-auth-guard.service";
import {InventoryAuthGuard} from "./util/guards/inventory-auth-guard.service";
import {StoreAuthGuard} from "./util/guards/store-auth-guard.service";
import {ReportsAuthGuard} from "./util/guards/reports-auth-guard.service";
import {DebugAuthGuard} from "./util/guards/debug-auth-guard.service";
import {EmployeesAuthGuard} from "./util/guards/employees-auth-guard.service";
import {SlimLoadingBarModule} from "ng2-slim-loading-bar";
import {DeliveryPackageService} from "./services/delivery-package.service";
import {ImageUploadModule} from "angular2-image-upload";
import {AdjustmentService} from "./services/adjustment.service";
import {PurchaseOrderService} from "./services/purchase-order.service";
import {AdjustmentLogService} from "./services/adjustment-log.service";
import {BarcodeService} from "./services/barcode.service";
import {Ng2Datetime} from "ng2-datetime-picker";
import {PatientService} from "./services/patient.service";
import {PatientGroupService} from "./services/patient-group.service";
import {ReceiptService} from "./services/receipt.service";
import {TransactionService} from "./services/transaction.service";
import {PosCartService} from "./services/pos-cart.service";
import {LineItemService} from "./services/line-item.service";
import {AlertService} from "./services/alert.service";
import {CountyService} from "./services/county.service";
import {TaxService} from "./services/tax.service";
import {DatePeriodService} from "./date-period.service";
import {TransactionTaxService} from "./services/transaction-tax.service";
import {LoyaltyRewardService} from "./services/loyalty-reward.service";
import {InventoryReportService} from "./services/report-services/inventory-report.service";
import {PatientReportService} from "./services/report-services/patient-report.service";
import {PackagePriceAdjustmentService} from "./services/package-price-adjustment.service";
import {PackageUnusedLabelService} from "./services/package-unused-label.service";
import {ReceiptAdjustmentService} from "./services/receipt-adjustment.service";
import {StoreSettingsService} from "./services/store-settings.service";
import {TaxReportService} from "./services/report-services/tax-report.service";
import {StoreOversaleLimitService} from "./services/store-oversale-limit.service";
import {PatientOversaleLimitService} from "./services/patient-oversale-limit.service";
import {EmailSettingsService} from "./services/email-settings.service";
import {PricingTierService} from "./services/pricing-tier.service";
import {PricingTierWeightService} from "./services/pricing-tier-weight.service";
import {TimeClockService} from "app/services/time-clock.service";
import {DeviceService} from "./services/device.service";
import {DrawerService} from "./services/drawer.service";
import {DrawerLogService} from "./services/drawer-log.service";
import {DrawerRemovalService} from "./services/drawer-removal.service";
import {PosDeviceService} from "./services/pos-device.service";
import {DeliveryService} from "./services/delivery.service";
import {ScaleService} from "./services/scale.service";
import {DeviceProxyService} from "./services/device-proxy.service";
import {PrinterService} from "./services/printer.service";
import {SalesReportService} from "./services/report-services/sales-report.service";
import {TagService} from "./services/tag.service";
import {LoggingService} from "./services/logging.service";
import {ZangoService} from "./lib/zango";
import {PatientQueueService} from "./services/patient-queue.service";
import {SavedCartService} from "./services/saved-cart.service";
import {PhysicianService} from "./services/physician.service";
import {LightboxModule} from "angular2-lightbox";
import {CaregiverService} from "./services/caregiver.service";
import {PackageConversionService} from "./services/package-conversion.service";
import {VisitorService} from "./services/visitor.service";
import {ReloadService} from "./services/reload.service";
import {AdjustmentReasonService} from "./services/adjustment-reasons.service";
import {PatientNoteService} from "./services/patient-note.service";
import {LabTestResultService} from "./services/lab-test-result.service";
import {PreviousRouteService} from './services/previous-route.service';

//TODO should move to another file
Ng2Datetime.weekends = [];


@Injectable()
export class LoggingErrorHandler implements ErrorHandler {

    lastLog: number;

    constructor(private loggingService: LoggingService){}

    handleError(error: any): void {
        console.error(error);

        if(!this.lastLog || this.lastLog < (Date.now() - 10 * 1000)) {
            //TODO shouldn't be necessary but it is overloading the server
            this.lastLog = Date.now();
            this.loggingService.logError({
                message: error.message,
                stack: error.zoneAwareStack,

                component: error.ngDebugContext && error.ngDebugContext.component && error.ngDebugContext.component.constructor.name
            });
        }
    }
}


@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        UtilModule,

        CommonModule,
        BrowserAnimationsModule,

        AccountModule,
        HelpModule,

        AppRoutingModule,

        ImageUploadModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        LightboxModule
    ],
    providers: [
        SocketService,

        {provide: ErrorHandler, useClass: LoggingErrorHandler},

        ZangoService,

        AdminAuthGuard, PosAuthGuard,
        PatientsAuthGuard, InventoryAuthGuard, StoreAuthGuard, ReportsAuthGuard, EmployeesAuthGuard,
        DebugAuthGuard,

        PosListDrawerGuard,

        UserService, PermissionService,
        AdjustmentService,
        AdjustmentLogService,

        DatePeriodService,

        PackageBarcodeNavigationService,
        PackageService,
        PatientService, PatientGroupService, PatientNoteService,
        ProductService, ProductVariationService,
        ItemService, ProductTypeService,
        StoreService, SupplierService,
        DiscountService, TransferService,
        DeliveryPackageService,
        AdjustmentService, PurchaseOrderService,
        BarcodeService, PosCartService,
        ReceiptService, LineItemService, TransactionService,
        AlertService,
        TaxService,
        TransactionTaxService,
        LoyaltyRewardService,
        PackagePriceAdjustmentService,
        PackageUnusedLabelService,
        ReceiptAdjustmentService,
        StoreSettingsService,
        InventoryReportService, TaxReportService, SalesReportService, PatientReportService,
        StoreOversaleLimitService,
        PatientOversaleLimitService,
        EmailSettingsService,
        PricingTierService,
        PricingTierWeightService,
        TimeClockService,
        DeviceService,
        DrawerService,
        DrawerLogService,
        DrawerRemovalService,
        PosDeviceService,
        DeliveryService,
        ScaleService,
        PrinterService,
        DeviceProxyService,
        TagService,
        LoggingService,
        PatientQueueService,
        SavedCartService,
        PhysicianService,
        CaregiverService,
        PackageConversionService,
        CountyService,
        AdjustmentReasonService,
        LabTestResultService,
        VisitorService,
        CountyService,
        AdjustmentReasonService,
        LabTestResultService,
        PreviousRouteService,
        ReloadService

        // Ng2NotifyService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
