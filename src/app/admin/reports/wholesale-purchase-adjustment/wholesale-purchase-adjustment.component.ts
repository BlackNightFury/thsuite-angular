import {Component, Injector, OnInit, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {PackageService} from "../../../services/package.service";
import {IPackage} from "../../../models/interfaces/package.interface";
import {CommonAdapter} from "../../../util/select2-adapters/common-adapter";

import * as moment from 'moment';
import {didSet} from "../../../lib/decorators/property/didSet";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {Subject} from "rxjs/Subject";
import {ObjectsIndexComponent} from "../../../util/objects-index.component";
import {DateRange} from "../../../lib/date-range";

import {StoreService} from "../../../services/store.service";
import {IStore} from "../../../models/interfaces/store.interface";

@Component({
    selector: 'app-inventory-index',
    templateUrl: './wholesale-purchase-adjustment.component.html',
    styleUrls: [ './wholesale-purchase-adjustment.component.css' ]
})

export class WholesalePurchaseAdjustmentComponent extends ObjectsIndexComponent<IPackage> implements OnInit, OnDestroy {

    private currentStoreEmittedSubscription: Subscription;
    store: IStore;

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    constructor(injector: Injector, private packageService: PackageService, private storeService: StoreService) {
        super(injector, packageService);
    }

    ngOnDestroy() {
        this.currentStoreEmittedSubscription && this.currentStoreEmittedSubscription.unsubscribe();
    }

    ngOnInit() {

        this.currentStoreEmittedSubscription = this.storeService.currentStoreEmitted.subscribe(store => {
            this.store = store
            this.dateRangeSource.subscribe(dateRange => this.extraFilters.next(dateRange))
            this.sortBy.next( new SortBy( 'createdAt', 'desc' ) )
            super.ngOnInit();
        })

    }

    onClickExport() {
        Observable.combineLatest( this.dateRangeSource, this.sortBy, (dateRange,sortBy) => ( { startDate: dateRange.startDate, endDate: dateRange.endDate, sortBy } ) )
        .take(1).subscribe( args => {
            this.packageService.exportPackages( Object.assign( args, { timeZone: this.store.timeZone } ) ).then((url) => {
                var iframe = $("<iframe/>").attr({
                    src: url.Location,
                    style: "visibility:hidden;display:none"
                }).appendTo(".content");
            })
        } )
    }
}
