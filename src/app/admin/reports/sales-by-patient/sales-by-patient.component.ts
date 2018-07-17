import {Component, OnInit} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {DateRange} from "../../../lib/date-range";

@Component({
    selector: 'app-sales-by-patient',
    templateUrl: './sales-by-patient.component.html',
})
export class SalesByPatientComponent implements OnInit {

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    constructor() {
    }

    ngOnInit() {
    }

}
