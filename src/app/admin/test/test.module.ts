import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {TestRoutingModule} from "./test-routing.module";
import {TestComponent} from "./test.component";
import {UtilModule} from "../../util/util.module";

import {TestBarcodeComponent} from "./test-barcode/test-barcode.component";
import {TestDrawerComponent} from "./test-drawer/test-drawer.component";
import {TestItemComponent} from "./test-item/test-item.component";
import {TestLineItemComponent} from "./test-line-item/test-line-item.component";
import {TestPackageComponent} from "./test-package/test-package.component";
import {TestProductComponent} from "./test-product/test-product.component";
import {TestReceiptComponent} from "./test-receipt/test-receipt.component";
import {TestTransactionComponent} from "./test-transaction/test-transaction.component";

@NgModule({
    imports: [
        CommonModule,
        TestRoutingModule,

        UtilModule
    ],
    providers: [],
    declarations: [TestComponent, TestBarcodeComponent, TestDrawerComponent, TestItemComponent, TestLineItemComponent, TestPackageComponent, TestProductComponent, TestReceiptComponent, TestTransactionComponent]
})
export class TestModule {
}
