import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {PosRoutingModule} from "./pos-routing.module";
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {PosComponent} from "./pos.component";
import {CartComponent} from "./pos-cart/pos-cart.component";
import {ProductCardComponent} from "./product-card/product-card.component";
import {PosPatientQueueComponent} from "./pos-patient-queue/pos-patient-queue.component";
import {PosProductDetailsComponent} from "./pos-product-details/pos-product-details.component";
import {PosCartService} from "../services/pos-cart.service";
import {PosListComponent} from "./pos-list/pos-list.component";
import {PosListLeftNavComponent} from "./pos-list-left-nav/pos-list-left-nav.component";
import {PosTopNavComponent} from "./pos-top-nav/pos-top-nav.component";
import {TransactionService} from "../services/transaction.service";
import {BarcodeService} from "../services/barcode.service";
import {PosRefundDetailModalComponent} from "./pos-refund-detail-modal/pos-refund-detail-modal.component";
import {PosManagerApprovalModalComponent} from "./pos-manager-approval-modal/pos-manager-approval-modal.component";
import {PosAgeVerificationModalComponent} from "./pos-age-verification-modal/pos-age-verification-modal.component";
import {PosRightNavComponent} from "./pos-right-nav/pos-right-nav.component";
import {PosReceiptComponent} from "./pos-receipt/pos-receipt.component";
import {PosReceiptVoidModalComponent} from "./pos-receipt-void-modal/pos-receipt-void-modal.component";
import {PosPinEntryModalComponent} from "../modals/pos-pin-entry-modal/pos-pin-entry-modal.component";
import {PosVoidDetailModalComponent} from "./pos-void-detail-modal/pos-void-detail-modal.component";
import {AddEditViewPosReceiptComponent} from "./pos-receipt/add-edit-view-receipt/add-edit-view-receipt.component";
import {PosDrawerComponent} from "./pos-drawer/pos-drawer.component";
import {PosDrawerStartModalComponent} from "./pos-drawer-start-modal/pos-drawer-start-modal.component";
import {PosDrawerEndModalComponent} from "./pos-drawer-end-modal/pos-drawer-end-modal.component";
import {PosSettingsComponent} from "./pos-settings/pos-settings.component";
import {PosSettingsDashboardComponent} from "./pos-settings-dashboard/pos-settings-dashboard.component";
import {PosSettingsDashboardLeftNavComponent} from "./pos-settings-dashboard-left-nav/pos-settings-dashboard-left-nav.component";
import {PosTimeClockComponent} from "./pos-time-clock/pos-time-clock.component";
import {PosOversaleModalComponent} from "./pos-oversale-modal/pos-oversale-modal.component";
import {PosPatientOversaleModalComponent} from "./pos-patient-oversale-modal/pos-patient-oversale-modal.component";
import {PosDeviceRegistrationModalComponent} from "./pos-device-registration-modal/pos-device-registration-modal.component";
import {PosTransactionCompletedModalComponent} from "./pos-transaction-completed-modal/pos-transaction-completed-modal.component";
import {PosExplainDrawerNavigationModalComponent} from "./pos-explain-drawer-navigation-modal/pos-explain-drawer-navigation-modal.component";
import {PosDrawerClosingReportComponent} from "./pos-drawer/closing-report/pos-drawer-closing-report.component";
import {PosCustomDiscountModalComponent} from "./pos-custom-discount-modal/pos-custom-discount-modal.component";
import {ModalsModule} from "../modals/modals.module";
import {PosBulkFlowerModalComponent} from "./pos-bulk-flower-modal/pos-bulk-flower-modal.component";
import {OwlDateTimeModule,OwlNativeDateTimeModule} from 'ng4-pick-datetime';
import {PosInventoryComponent} from './pos-inventory/pos-inventory.component';
import { PosAssignPatientToPatientGroupModalComponent } from './pos-assign-patient-to-patient-group-modal/pos-assign-patient-to-patient-group-modal.component';

@NgModule({
    imports: [
        CommonModule,

        FormsModule,

        PosRoutingModule,
        ModalsModule,

        OwlDateTimeModule,
        OwlNativeDateTimeModule,

        UtilModule,
    ],
    declarations: [
        //Main POS Components
        CartComponent,
        ProductCardComponent,
        PosRightNavComponent,
        PosPatientQueueComponent,
        PosProductDetailsComponent,
        PosComponent,
        PosListComponent,
        PosTopNavComponent,
        PosListLeftNavComponent,

        //Settings Components
        PosReceiptComponent,
        PosReceiptVoidModalComponent,
        AddEditViewPosReceiptComponent,
        PosDrawerComponent,
        PosSettingsComponent,
        PosSettingsDashboardComponent,
        PosTimeClockComponent,
        PosSettingsDashboardLeftNavComponent,
        PosDrawerClosingReportComponent,
        PosInventoryComponent,

        //Modal Components
        PosRefundDetailModalComponent,
        PosManagerApprovalModalComponent,
        PosAgeVerificationModalComponent,
        PosVoidDetailModalComponent,
        PosDrawerStartModalComponent,
        PosDrawerEndModalComponent,
        PosCustomDiscountModalComponent,
        PosOversaleModalComponent,
        PosPatientOversaleModalComponent,
        PosDeviceRegistrationModalComponent,
        PosTransactionCompletedModalComponent,
        PosExplainDrawerNavigationModalComponent,
        PosBulkFlowerModalComponent,
        PosPinEntryModalComponent,
        PosAssignPatientToPatientGroupModalComponent,
    ],
    exports: [PosSettingsDashboardLeftNavComponent],
    providers: []
})
export class PosModule {
}
