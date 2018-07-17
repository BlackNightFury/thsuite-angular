import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {TestComponent} from "./test.component";
import {TestBarcodeComponent} from "./test-barcode/test-barcode.component";
import {TestDrawerComponent} from "./test-drawer/test-drawer.component";
import {TestItemComponent} from "./test-item/test-item.component";
import {TestLineItemComponent} from "./test-line-item/test-line-item.component";
import {TestPackageComponent} from "./test-package/test-package.component";
import {TestProductComponent} from "./test-product/test-product.component";
import {TestReceiptComponent} from "./test-receipt/test-receipt.component";
import {TestTransactionComponent} from "./test-transaction/test-transaction.component";

const routes: Routes = [
    {
        path: '',
        component: TestComponent,
        data: {sectionTitle: 'Test Services'},
        children: [
            {
                path: 'barcode',
                component: TestBarcodeComponent,
                data: {sectionTitle: 'Test Barcode'}
            },
            {
                path: 'drawer',
                component: TestDrawerComponent,
                data: {sectionTitle: 'Test Drawer'}
            },
            {
                path: 'item',
                component: TestItemComponent,
                data: {sectionTitle: 'Test Item'}
            },
            {
                path: 'line-item',
                component: TestLineItemComponent,
                data: {sectionTitle: 'Test Line Item'}
            },
            {
                path: 'package',
                component: TestPackageComponent,
                data: {sectionTitle: 'Test Package'}
            },
            {
                path: 'product',
                component: TestProductComponent,
                data: {sectionTitle: 'Test Product'}
            },
            {
                path: 'receipt',
                component: TestReceiptComponent,
                data: {sectionTitle: 'Test Receipt'}
            },
            {
                path: 'transaction',
                component: TestTransactionComponent,
                data: {sectionTitle: 'Test Transaction'}
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TestRoutingModule {
}
