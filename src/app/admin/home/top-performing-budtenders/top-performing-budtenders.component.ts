import {Component, OnInit} from "@angular/core";
import {DatePeriodService} from "../../../date-period.service";
import {StoreService} from "../../../services/store.service";
import {Observable} from "rxjs";
import {Select2OptionData} from "ng2-select2";

@Component({
    selector: 'app-top-performing-budtenders',
    templateUrl: './top-performing-budtenders.component.html'
})
export class TopPerformingBudtendersComponent implements OnInit {
    public exampleDatePeriods: Observable<Select2OptionData[]>;

    stores: Observable<Select2OptionData[]>;

    constructor(private storeService: StoreService,
                private datePeriodService: DatePeriodService) {
    }

    ngOnInit() {

        this.exampleDatePeriods = this.datePeriodService.getDatePeriods();

        this.stores = this.storeService.all().switchMap((stores) => {
            return Observable.combineLatest(stores, (...stores) => {
                return stores.map(store => {
                    return {
                        id: store.id,
                        text: store.name
                    }
                })
            });
        });
    }
}
