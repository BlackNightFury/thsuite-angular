import { Component, OnInit, ViewEncapsulation, Injector, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { didSetUnreceivedToggle, didSetFinishedToggle, didSetSelectedSupplierIds } from '../../admin/inventory/packages/packages.component';
import { PackageService } from '../../services/package.service';
import { ObjectsIndexComponent } from '../../util/objects-index.component';
import { IPackage } from '../../models/interfaces/package.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { didSet } from '../../lib/decorators/property/didSet';
import { SupplierService } from '../../services/supplier.service';
import { ProductService } from '../../services/product.service';
import { PreviousRouteService } from '../../services/previous-route.service';
import { SortBy } from '../../util/directives/sort-table-header.directive';
import { CommonAdapter } from '../../util/select2-adapters/common-adapter';
import { BarcodeService } from '../../services/barcode.service';
import { IProductVariation } from '../../models/interfaces/product-variation.interface';
import { IBarcode } from '../../models/interfaces/barcode.interface';

export class PackageWithProductData {
    object: IPackage;
    productName: string;
    productVariations: IProductVariation[];
    barcode: IBarcode[];
}

let persistentSearchCriteria = {
  supplierId : "",
  finished : "hide",
  unreceived : "hide",
  searchTerms : "",
  pageNumber : 0
};

@Component({
  selector: 'app-pos-inventory',
  templateUrl: './pos-inventory.component.html',
  styleUrls: ['./pos-inventory.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PosInventoryComponent extends ObjectsIndexComponent<IPackage> implements OnInit, OnDestroy {

  supplierSelectOptions: Select2Options;

    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    packages: Observable<PackageWithProductData[]>;

    showHideToggleOptions = [
        {
            label: "Show",
            value: "show"
        },
        {
            label: "Hide",
            value: "hide"
        }
    ];

    objectsSubscription: Subscription;
    pageSubscription: Subscription;
    searchTermsSubscription: Subscription;

    finishedToggleSource: BehaviorSubject<string> = new BehaviorSubject('hide');
    unreceivedToggleSource: BehaviorSubject<string> = new BehaviorSubject('hide');

    @didSet(didSetUnreceivedToggle) unreceivedToggle: string;

    @didSet(didSetFinishedToggle) finishedToggle: string;

    @didSet(didSetSelectedSupplierIds) selectedSupplierId: string;

    localSearchTerms = "";

    constructor(
        injector: Injector,
        private packageService: PackageService,
        private supplierService: SupplierService,
        private productService: ProductService,
        private previousRouteService: PreviousRouteService,
        private barcodeService: BarcodeService
    ) {
        super(injector, packageService);

        this.localSearchTerms = persistentSearchCriteria.searchTerms;
    }

    ngOnInit() {
        this.sortByModel = new SortBy('Quantity', 'asc');
        super.ngOnInit();

        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/inventory/packages");

        this.route.queryParams.subscribe(params => {
            if(params.page){
                this.goToPage(params.page);
            }
        });

        this.objectsSubscription = this.objects.subscribe(objects => {
            let observables = [];
            for(let object of objects){
                let obs = Observable.combineLatest(
                    this.packageService.getBarcodeIds(object.id),
                    this.packageService.getHasPrice(object.id),
                    this.productService.getByPackageId(object.id),
                    this.barcodeService.getByPackageId(object.id)
                ).switchMap(([barcodeIds, hasPrice, productObservable, barcode]) => {
                    return Observable.combineLatest(
                        productObservable,
                        (product) => {
                            object.barcodeIds = barcodeIds;
                            object.hasPrices = hasPrice;

                            const withProductData: PackageWithProductData = {
                                object: object,
                                productName: product.name,
                                productVariations: product.ProductVariations,
                                barcode: barcode
                            };

                            return withProductData;
                        }
                    )
                }).catch( e => {
                    console.log(e);
                    return Observable.of<any>([]);
                });

                observables.push(obs);
            }

            this.packages = Observable.combineLatest(observables);

        });

        CommonAdapter(this.supplierService, 'id', 'name',{})
            .then(SupplierAdapter => {
                let supplierSelectOptions = {
                    ajax: {},
                    placeholder: "Filter by Supplier",
                    allowClear: true
                    // multiple: true
                };

                supplierSelectOptions['dataAdapter'] = SupplierAdapter;

                this.supplierSelectOptions = supplierSelectOptions;
            });

        Observable.combineLatest(
            this.selectedSupplierIdSource,
            this.finishedToggleSource,
            this.unreceivedToggleSource,
        ).subscribe(([supplierId, finishedMode, unreceivedMode]) => {
            this.extraFilters.next({supplierId, finishedMode, unreceivedMode, advancedBarcodeSearch: true});
        });

        this.prepareSearch(navigationFromChild);
    }

    prepareSearch(rememberSearchPosition:boolean){

        if(rememberSearchPosition) {
            this.unreceivedToggle = persistentSearchCriteria.unreceived;
            this.finishedToggle = persistentSearchCriteria.finished;
            this.selectedSupplierId = persistentSearchCriteria.supplierId;

            this.searchTerms.next(persistentSearchCriteria.searchTerms);

            this.pageModel = persistentSearchCriteria.pageNumber;
        } else {
            this.unreceivedToggle = 'hide';
            this.finishedToggle = 'hide';
            this.selectedSupplierId = '';
        }

        this.selectedSupplierIdSource.next(this.selectedSupplierId);
        this.finishedToggleSource.next(this.finishedToggle);
        this.unreceivedToggleSource.next(this.unreceivedToggle);

        this.searchTermsSubscription = this.searchTerms.debounceTime(300).subscribe((value) => {
            persistentSearchCriteria.searchTerms = value;
            this.localSearchTerms = value;
        });

        this.pageSubscription = this.page.subscribe((value) => {
            persistentSearchCriteria.pageNumber = value;
	    });
    }

    ngOnDestroy(){
	    this.objectsSubscription && this.objectsSubscription.unsubscribe();
	    this.pageSubscription && this.pageSubscription.unsubscribe();
	    this.searchTermsSubscription && this.searchTermsSubscription.unsubscribe();
    }

    onRowClick(event, _package: IPackage){

        this.packageService.detailView(_package);
    }

    onClickExport() {

    }

}
