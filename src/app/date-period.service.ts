import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export class DatePeriodService {

    constructor() {
    }

    static examplePeriods = [
        {
            id: 'today',
            text: 'Today'
        },
        {
            id: 'this-week',
            text: 'This Week'
        },
        {
            id: 'this-month',
            text: 'This Month'
        },
        {
            id: 'this-year',
            text: 'This Year'
        }
    ]


    getDatePeriods() {
        return Observable.from([DatePeriodService.examplePeriods])
    }
}
