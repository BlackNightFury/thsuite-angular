import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Select2OptionData} from "ng2-select2";
import {StoreService} from "../../../services/store.service";
import {DatePeriodService} from "../../../date-period.service";
import {SupplierService} from "../../../services/supplier.service";
import {ISupplier} from "../../../models/interfaces/supplier.interface";
import * as moment from "moment";
import {didSet} from "../../../lib/decorators/property/didSet";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Component({
    selector: 'app-bestselling-brands',
    templateUrl: './bestselling-brands.component.html'
})
export class BestsellingBrandsComponent implements OnInit {
    constructor(private storeService: StoreService,
                private datePeriodService: DatePeriodService,
                private supplierService: SupplierService) {
    }

    salesData: Observable<ISupplier>[];



    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    ngOnInit() {

        this.supplierService.getBestSellingDataForDashboard(this.dateRangeSource).subscribe((salesData) => {
            console.log(salesData);
            this.salesData = salesData;
        });
    }

}
