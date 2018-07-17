import {NgModule} from "@angular/core";
import {
    MdButtonModule, MdButtonToggleModule, MdCheckboxModule, MdIconModule, MdInputModule, MdMenuModule,
    MdSelectModule, MdRadioModule, MdTooltipModule, MdDialogModule, MdDialog, MdDialogRef, MD_DIALOG_DATA
} from "@angular/material";
import {Select2Module} from "ng2-select2";
import {CommonModule} from "@angular/common";
import {WaitForDirective} from "./directives/waitFor.directive";
import {PagerComponent} from "./components/pager/pager.component";
import {PinEntryComponent} from "./components/pin-entry/pin-entry.component";
import {NgPipesModule} from "ngx-pipes";
import {FormsModule} from "@angular/forms";
import {ButtonTogglerComponent} from "./components/button-toggler/button-toggler.component";
import {ButtonTogglerMultipleComponent} from "./components/multi-button-toggler/multi-button-toggler.component";
import {FormatArrayPipe} from "./pipes/formatDayArray.pipe";
import {ToNumberOrZeroPipe} from "./pipes/toNumberOrZero.pipe";
import {ToPhoneNumberPipe} from "./pipes/toPhoneNumber.pipe";
import {ToMedIDPipe} from "./pipes/toMedID.pipe";
import {LengthPipe} from "./pipes/length.pipe";
import {AveragePipe} from "./pipes/average.pipe";
import {Ng2DatetimePickerModule} from "ng2-datetime-picker";
import {TimePickerDirective} from "./directives/time-picker.directive";
import {HttpModule} from "@angular/http";
import {Select2Component} from "./components/select2/select2.component";
import {SortTableHeaderDirective} from "app/util/directives/sort-table-header.directive";
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';
import {GoogleChartDirective} from "./directives/angular2-google-chart.directive";
import {PreventBarcodeScannerDirective} from "./directives/prevent-barcode-scanner.directive";
import {ImageUploadModule} from "angular2-image-upload";
import {FileUploadComponent} from "./components/file-upload/file-upload.component";
import {FileUploadDropDirective} from "./components/file-upload/file-upload-drop.directive";
import {ImageService} from "angular2-image-upload/src/image-upload/image.service";
import {FileDropDirective} from "./directives/file-drop.directive";
import {THImageUploadComponent} from "./components/image-upload/image-upload.component";
import {CommifyPipe} from "./pipes/commify.pipe";
import {RoundPipe} from "./pipes/round.pipe";
import {MapValuesPipe} from "./pipes/mapValues.pipe"
import {StoreTimeZonePipe} from "./pipes/storeTimeZone.pipe";
import {TelephonePipe} from "./pipes/telephone.pipe";
import {TimePickerComponent} from "./components/time-picker/time-picker.component";
import {DateRangeSelectorComponent} from "./components/date-range-selector/date-range-selector.component";
import {MomentModule} from "angular2-moment";
import {RouterOutletComponent} from "./components/router-outlet/router-outlet.component";
import {RouterModule} from "@angular/router";
// import {Ng2Notify} from 'ng2-notify/notify';
import {OwlDateTimeModule,OwlNativeDateTimeModule,OWL_DATE_TIME_FORMATS} from 'ng4-pick-datetime';
import {ArrayMultiplyPipe} from "./pipes/arrayMultiply.pipe";

export const TH_NATIVE_FORMATS = {
    parseInput: "mm/dd/yyyy",
    fullPickerInput: {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'},
    datePickerInput: {year: 'numeric', month: '2-digit', day: '2-digit'},
    timePickerInput: {hour: '2-digit', minute: '2-digit'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
};

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,

        Select2Module,
        MdButtonModule,
        MdSelectModule,
        MdInputModule,
        MdButtonToggleModule,
        MdCheckboxModule,
        MdMenuModule,
        MdIconModule,
        MdTooltipModule,
        NgPipesModule,
        Ng2DatetimePickerModule,
        ImageUploadModule,
        MdRadioModule,
        MomentModule,
        RouterModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,

        MdDialogModule
    ],
    declarations: [
        WaitForDirective,
        TimePickerDirective,
        FileUploadDropDirective,
        TimePickerComponent,
        PagerComponent,
        PinEntryComponent,
        ButtonTogglerComponent,
        ButtonTogglerMultipleComponent,
        FormatArrayPipe,
        LengthPipe,
        AveragePipe,
        ToNumberOrZeroPipe,
        ToPhoneNumberPipe,
        ToMedIDPipe,
        FileUploadComponent,
        Select2Component,
        SortTableHeaderDirective,
        GoogleChartDirective,
        CommifyPipe,
        PreventBarcodeScannerDirective,
        RoundPipe,
        TelephonePipe,
        DateRangeSelectorComponent,
        StoreTimeZonePipe,
        RouterOutletComponent,
        MapValuesPipe,
        THImageUploadComponent,
        FileDropDirective,
        ArrayMultiplyPipe
        // Ng2Notify

    ],

    exports: [
        CommonModule,
        FormsModule,
        HttpModule,

        Select2Module,
        MdButtonModule,
        MdSelectModule,
        MdInputModule,
        MdButtonToggleModule,
        MdCheckboxModule,
        MdMenuModule,
        MdIconModule,
        MdTooltipModule,
        NgPipesModule,
        Ng2DatetimePickerModule,
        MdRadioModule,


        WaitForDirective,
        TimePickerDirective,
        TimePickerComponent,
        GoogleChartDirective,
        PreventBarcodeScannerDirective,

        PagerComponent,
        PinEntryComponent,
        ButtonTogglerComponent,
        ButtonTogglerMultipleComponent,
        THImageUploadComponent,
        FormatArrayPipe,
        LengthPipe,
        AveragePipe,
        ToNumberOrZeroPipe,
        ToPhoneNumberPipe,
        ToMedIDPipe,
        CommifyPipe,
        RoundPipe,
        TelephonePipe,
        StoreTimeZonePipe,
        MapValuesPipe,
        ArrayMultiplyPipe,
        ImageUploadModule,
        Select2Component,
        FileUploadComponent,
        SortTableHeaderDirective,

        RouterOutletComponent,

        DateRangeSelectorComponent,
        MomentModule,
        // Ng2Notify

        // MdDialog,
        // MdDialogRef
        MdDialogModule,
    ],

    providers : [
        ImageService,
        {provide: OWL_DATE_TIME_FORMATS, useValue: TH_NATIVE_FORMATS}
    ]
})
export class UtilModule {
}
