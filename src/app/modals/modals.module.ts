import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../util/util.module";
import {NgPipesModule} from "ngx-pipes";

import {PreviousPurchasesModalComponent} from "./previous-purchases-modal/previous-purchases-modal.component";
import {PatientIDModalComponent} from "./patient-id-modal/patient-id-modal.component";
import {ReleaseBudtenderModalComponent} from "./release-budtender-modal/release-budtender-modal.component";
import {TokenModalComponent} from "./token-modal/token-modal.component";
import {ExportOptionsModalComponent} from "./export-options-modal/export-options-modal.component";
import {PatientNotesModalComponent} from "./patient-notes-modal/patient-notes-modal.component";
import {PrintBarcodeModalComponent } from './print-barcode-modal/print-barcode-modal.component';
import {ManagerPinEntryModalComponent} from "./manager-pin-entry-modal/manager-pin-entry-modal.component";
import {RemoveCashModalComponent} from './remove-cash-modal/remove-cash-modal.component';

@NgModule({
    imports: [
        CommonModule,
        NgPipesModule,
        FormsModule,
        UtilModule
    ],

    declarations: [
        PreviousPurchasesModalComponent,
        PatientIDModalComponent,
        PatientNotesModalComponent,
        ReleaseBudtenderModalComponent,
        TokenModalComponent,
        PrintBarcodeModalComponent,
        ManagerPinEntryModalComponent,
        RemoveCashModalComponent,
        ExportOptionsModalComponent
    ],

    exports: [
        PreviousPurchasesModalComponent,
        PatientIDModalComponent,
        PatientNotesModalComponent,
        ReleaseBudtenderModalComponent,
        TokenModalComponent,
        PrintBarcodeModalComponent,
        ManagerPinEntryModalComponent,
        RemoveCashModalComponent,
        ExportOptionsModalComponent
    ],

    entryComponents: [
        PrintBarcodeModalComponent,
        ManagerPinEntryModalComponent,
        RemoveCashModalComponent
    ],
})
export class ModalsModule { }
