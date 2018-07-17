import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Select2OptionData} from "ng2-select2";
import {StoreService} from "../../../services/store.service";
import {DatePeriodService} from "../../../date-period.service";
import {ProductService} from "../../../services/product.service";
import {IProduct} from "../../../models/interfaces/product.interface";
import {didSet} from "../../../lib/decorators/property/didSet";
import * as moment from "moment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import {ReplaySubject} from "rxjs/ReplaySubject";


@Component({
    selector: 'app-bestselling-products',
    templateUrl: './bestselling-products.component.html'
})
export class BestsellingProductsComponent implements OnInit {

    stores: Observable<Select2OptionData[]>;

    constructor(private storeService: StoreService,
                private datePeriodService: DatePeriodService,
                private productService: ProductService) {
    }

    salesData: Observable<IProduct>[];


    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    ngOnInit() {

        // this.stores = this.storeService.all().switchMap((stores) => {
        //     return Observable.combineLatest(stores, (...stores) => {
        //         return stores.map(store => {
        //             return {
        //                 id: store.id,
        //                 text: store.name
        //             }
        //         })
        //     });
        // });

        this.productService.getBestSellingDataForDashboard(this.dateRangeSource).subscribe((salesData) => {
            console.log(salesData);
            this.salesData = salesData;
        });
    }
}
