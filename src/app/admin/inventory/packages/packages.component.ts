import {Component, Injector, OnInit, OnDestroy, Output} from "@angular/core";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {IPackage} from "../../../models/interfaces/package.interface";
import {PackageService} from "../../../services/package.service";
import {SupplierService} from "../../../services/supplier.service";
import {Router} from "@angular/router";
import {Package} from "../../../models/package.model";
import {didSet} from "../../../lib/decorators/property/didSet";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {Subject} from "rxjs/Subject";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";
import {Observable} from "rxjs/Observable";
import {ProductService} from "../../../services/product.service";
import {BarcodeService} from "../../../services/barcode.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subscription} from "rxjs/Subscription";
import {PreviousRouteService} from '../../../services/previous-route.service';
import {PatientService} from "../../../services/patient.service";

export class PackageWithProductName{
    object: IPackage;
    productName: string;
}

export function didSetSelectedSupplierIds(newValue: string){
    this.selectedSupplierIdSource.next(newValue);

    persistentSearchCriteria.supplierId = newValue;
}

export function didSetFinishedToggle(newValue: string){
    this.finishedToggleSource.next(newValue);

    persistentSearchCriteria.finished = newValue;
}

export function didSetUnreceivedToggle(newValue: string){
    this.unreceivedToggleSource.next(newValue);

    persistentSearchCriteria.unreceived = newValue;
}

let persistentSearchCriteria = {
    supplierId : "",
    finished : "hide",
    unreceived : "hide",
    searchTerms : "",
    pageNumber : 0
};

@Component({
    selector: 'app-package',
    templateUrl: './packages.component.html'
})
export class PackagesComponent extends ObjectsIndexComponent<IPackage> implements OnInit, OnDestroy {

    supplierSelect2Options: Select2Options;

    selectedSupplierIdSource: BehaviorSubject<string> = new BehaviorSubject(undefined);

    packages: Observable<PackageWithProductName[]>;

    @Output() isPackageIndexExportModalShowing: boolean = false;
    @Output() isPackageIndexExportModalAboutToClose: boolean = false;

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

    localSearchTerms:string = "";

    constructor(
        injector: Injector,
        private packageService: PackageService,
        private supplierService: SupplierService,
        private productService: ProductService,
        private barcodeService: BarcodeService,
        private previousRouteService: PreviousRouteService
    ) {
        super(injector, packageService);

        this.localSearchTerms = persistentSearchCriteria.searchTerms;
    }

    ngOnInit() {
        super.ngOnInit();

        var navigationFromChild = this.previousRouteService.previousUrlContains("admin/inventory/packages");

        this.route.queryParams.subscribe(params => {
            if(params.page){
                this.goToPage(params.page);
            }
        });

        this.sortByModel = new SortBy( 'ReceivedDateTime', 'desc' );

        this.objectsSubscription = this.objects.subscribe(objects => {
            let observables = [];
            for(let object of objects){
                let obs = Observable.combineLatest(
                    this.packageService.getHasPrice(object.id),
                    this.productService.getByPackageId(object.id),
                    this.barcodeService.getByPackageId(object.id)
                ).switchMap(([hasPrice, productObservable, barcodes]) => {

                    return Observable.combineLatest(
                        productObservable,
                        (product) => {
                            object.hasPrices = hasPrice;

                            var hasBarcodesForEachVariation = true;

                            for(let pv of product.ProductVariations){
                                var hasBarcodesForThisVariation = false;

                                for(let b of barcodes){
                                    if(b.productVariationId == pv.id){
                                        hasBarcodesForThisVariation = true;
                                        break;
                                    }
                                }

                                if(!hasBarcodesForThisVariation) {
                                    hasBarcodesForEachVariation = false;
                                    break;
                                }
                            }

                            let withProductName = {
                                object: object,
                                productName: product.name,
                                hasBarcodesForEachVariation: hasBarcodesForEachVariation
                            };

                            return withProductName;
                        }
                    )
                });

                observables.push(obs);
            }

            this.packages = Observable.combineLatest(observables);
        });

        CommonAdapter(this.supplierService, 'id', supplier => `<div class="flex-row"><div class="flex-col-50 align-left">${supplier.name}</div><div class="flex-col-50 align-right">${supplier.licenseNumber}</div>`)
            .then(SupplierAdapter => {
                let supplierSelectOptions = {
                    ajax: {},
                    placeholder: "Supplier",
                    allowClear: true,
                    dropdownCssClass: 'compact'
                    // multiple: true
                };

                supplierSelectOptions['dataAdapter'] = SupplierAdapter;

                this.supplierSelect2Options = supplierSelectOptions;
            });

        Observable.combineLatest(
            this.selectedSupplierIdSource,
            this.finishedToggleSource,
            this.unreceivedToggleSource,
        ).subscribe(([supplierId, finishedMode, unreceivedMode]) => {
            this.extraFilters.next({supplierId, finishedMode, unreceivedMode});
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

        this.searchTermsSubscription = this.searchTerms.subscribe((value) => {
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
        this.isPackageIndexExportModalShowing = true;
    }

    onPackageIndexExportModalClosed() {
        window.setTimeout(() => {
            this.isPackageIndexExportModalShowing = false;
            this.isPackageIndexExportModalAboutToClose = false;
        }, 100)
    }

    onPackageIndexExportModalExport(type: string) {
        this.export(type);
    }

    export(type: string) {
        const { selectedSupplierId, finishedToggle, unreceivedToggle } = this;
        this.packageService.exportPackageReport({
            type,
            supplierId: selectedSupplierId,
            finishedMode: finishedToggle,
            unreceivedMode: unreceivedToggle,
            query: this.localSearchTerms,
            sortBy: this.sortByModel,
        }).then((url) => {
            $("<iframe/>").attr({
                src: url,
                style: "visibility:hidden;display:none"
            }).appendTo(".content");

            // Can't immediately remove component because it has external modal dialog dom changes
            // Therefore additional property is triggered to close modal dialog first
            this.isPackageIndexExportModalAboutToClose = true;
        });
    }
}
