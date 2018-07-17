import {Component, OnInit} from "@angular/core";
import {StoreService} from "../../../services/store.service";
import {Select2OptionData} from "ng2-select2";
import {DatePeriodService} from "../../../date-period.service";
import {Observable} from "rxjs";
import {ProductTypeService} from "../../../services/product-type.service";
import {didSet} from "../../../lib/decorators/property/didSet";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";


import * as moment from 'moment';
import * as formatCurrency from 'format-currency';
import {ReplaySubject} from "rxjs/ReplaySubject";

export function didSetSelectedType(newValue) {
    this.setChartData(newValue);
}

@Component({
    selector: 'app-sales-by-product-type',
    templateUrl: './sales-by-product-type.component.html'
})
export class SalesByProductTypeComponent implements OnInit {

    salesData: any[];
    chartData: Array<Array<any>>;
    chartOptions: any;

    stores: Observable<Select2OptionData[]>;

    @didSet(didSetSelectedType) selectedType: string = "dollars";

    typeSelect2Options: Select2Options = {
        placeholder: 'View Type',
        data: [
            {
                id: 'dollars',
                text: 'Dollars'
            },
            {
                id: 'units',
                text: 'Units'
            }
        ]
    };

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);




    constructor(private productTypeService: ProductTypeService) {
    }

    ngOnInit() {
        this.productTypeService.getReportData(this.dateRangeSource).subscribe((salesData) => {
            this.salesData = salesData;
            this.setChartData(this.selectedType);
        });
    }

    formatAmount(dollars): String {
        const opts = { format: '%s%v', code: 'USD', symbol: '$' };
        return formatCurrency(dollars, opts);
    }

    setChartData(type: string){
        this.chartData = undefined;
        let chartData = [["Product Type", "Total Sales", {role: "annotation"}]];

        let vAxisMax = null;

        if(this.salesData) {
            this.salesData.forEach(productType => {

                if (productType.name != "Total") {
                    let dataRow = [];
                    dataRow.push(productType.name);
                    if (type == "dollars") {
                        dataRow.push(productType.sum);

                        vAxisMax = Math.max(vAxisMax, productType.sum);

                        dataRow.push(this.formatAmount(productType.sum));
                    } else {
                        dataRow.push(productType.count);
                        vAxisMax = Math.max(vAxisMax, productType.count);
                        dataRow.push(productType.count);
                    }

                    chartData.push(dataRow);
                }

            });

            if (chartData.length > 1) {
                this.chartData = chartData;
            }

            //Room for annotations
            vAxisMax += (vAxisMax * 0.3);

            this.chartOptions = {
                animation: {
                    startup: true,
                    duration: 500,
                    easing: 'out'
                },
                annotations: {
                    alwaysOutside: true,
                    highContrast: true,
                    stem: {color: 'white'},
                    textStyle: {
                        fontSize: 22,
                        color: '#4C6379',

                    }
                },
                chartArea: {width: '100%', height: '80%'},
                height: 400,
                hAxis: {
                    textStyle: {color: '#6e858c'}
                },
                series: {
                    0: {color: '#18A9E2'}
                },
                vAxis: {
                    format: 'currency',
                    gridlines: {
                        count: 0
                    },
                    textStyle: {color: '#6e858c'},
                    viewWindow: {
                        max: vAxisMax
                    }
                }
            }
        }



    }

}
