import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

import {PatientReportService} from "../../../services/report-services/patient-report.service";
import {IProductType} from "../../../models/interfaces/product-type.interface";
import {SortBy} from "../../../util/directives/sort-table-header.directive";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DateRange} from "../../../lib/date-range";
import * as moment from 'moment-timezone';
import * as formatCurrency from 'format-currency';
// import * as pdfMake from 'pdfmake';
import {didSet} from "../../../lib/decorators/property/didSet";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import {environment} from  "../../../../environments/environment";

@Component({
    selector: 'app-patients-index',
    templateUrl: './patients-index.component.html',
    styleUrls: [ './patients-index.component.css' ]
})
export class PatientsIndexComponent implements OnInit {

    salesTotals: any = {
        totalRevenue: 0,
        totalPatients: 0,
        totalTransactions: 0
    };

    salesDataByCounty: Observable<any>[];
    _salesDataByCounty: Array<any> = [];

    salesDataByType: Observable<any>[];
    _salesDataByType: Array<any> = [];

    salesDataByMedicalCondition: Observable<any>[];
    _salesDataByMedicalCondition: Array<any> = [];

    dateRangeSource: ReplaySubject<DateRange> = new ReplaySubject(1);

    chartData: Array<Array<any>>;

    chartOptions = {
        animation : {
            startup: true,
            duration: 500,
            easing: 'out'
        },
        chartArea : {height: '75%', width: '80%'},
        hAxis: {
            textStyle: {color: '#6e858c'},
            gridlines: {count: 12}
        },
        height: 400,
        series: {
            0: {targetAxisIndex: 0, color: '#169fd3'},
            1: {targetAxisIndex: 0, color: '#28bd8b'},
            2: {targetAxisIndex: 1, color: '#ff0000'}
        },
        tooltip: {
            textStyle: {color: '#6e858c'},
            isHtml: true
        },
        vAxes: {
            0: {
                title: 'Patients / Transactions',
                format: '',
                textStyle: {color: '#6e858c'}
            },
            1: {
                title: 'Revenue',
                format: 'currency',
                textStyle: {color: '#6e858c'}
            }
        }
    };

    private limitPerPage = 10;

    _sortByType: SortBy;
    get sortByModelByType(): SortBy {
        return this._sortByType;
    }
    set sortByModelByType(value: SortBy) {
        this._sortByType = value;
        if (!value) {
            this.salesDataByType = [];
            this._salesDataByType.forEach(row => {
                this.salesDataByType.push(row);
            });
        } else {
            this._salesDataByType.sort(this.dynamicSort(value));
        }

        this.pageModelOfDataByType = 0;
    }

    private pageOfDataByType = new BehaviorSubject<number>(0);
    numPagesOfDataByType: number;
    _pageOfDataByType = 0;
    get pageModelOfDataByType(): number {
        return this._pageOfDataByType;
    }
    set pageModelOfDataByType(value: number) {
        this._pageOfDataByType = Math.max(0, value);
        this.pageOfDataByType.next(this._pageOfDataByType);
    }

    _sortByCounty: SortBy;
    get sortByModelByCounty(): SortBy {
        return this._sortByCounty;
    }
    set sortByModelByCounty(value: SortBy) {
        this._sortByCounty = value;
        if (!value) {
            this.salesDataByCounty = [];
            this._salesDataByCounty.forEach(row => {
                this.salesDataByCounty.push(row);
            });
        } else {
            this._salesDataByCounty.sort(this.dynamicSort(value));
        }

        this.pageModelOfDataByCounty = 0;
    }

    private pageOfDataByCounty = new BehaviorSubject<number>(0);
    numPagesOfDataByCounty: number;
    _pageOfDataByCounty = 0;
    get pageModelOfDataByCounty(): number {
        return this._pageOfDataByCounty;
    }
    set pageModelOfDataByCounty(value: number) {
        this._pageOfDataByCounty = Math.max(0, value);
        this.pageOfDataByCounty.next(this._pageOfDataByCounty);
    }

    _sortByMedicalCondition: SortBy;
    get sortByModelByMedicalCondition(): SortBy {
        return this._sortByMedicalCondition;
    }
    set sortByModelByMedicalCondition(value: SortBy) {
        this._sortByMedicalCondition = value;
        if (!value) {
            this.salesDataByMedicalCondition = [];
            this._salesDataByMedicalCondition.forEach(row => {
                this.salesDataByMedicalCondition.push(row);
            });
        } else {
            this._salesDataByMedicalCondition.sort(this.dynamicSort(value));
        }

        this.pageModelOfDataByMedicalCondition = 0;
    }

    private pageOfDataByMedicalCondition = new BehaviorSubject<number>(0);
    numPagesOfDataByMedicalCondition: number;
    _pageOfDataByMedicalCondition = 0;
    get pageModelOfDataByMedicalCondition(): number {
        return this._pageOfDataByMedicalCondition;
    }
    set pageModelOfDataByMedicalCondition(value: number) {
        this._pageOfDataByMedicalCondition = Math.max(0, value);
        this.pageOfDataByMedicalCondition.next(this._pageOfDataByMedicalCondition);
    }

    constructor(private patientReportService: PatientReportService, private loadingBarService: SlimLoadingBarService, private router: Router) {
        if (!environment['shouldShowMedicalReports']) {
            this.router.navigate(['admin', 'home']);
        }
    }

    ngOnInit() {
        this.patientReportService.getSellingData(this.dateRangeSource, 'all')
            .do(() => {
                this.chartData = undefined;
                this.salesTotals = {
                    totalRevenue: 0,
                    totalPatients: 0,
                    totalTransactions: 0
                };
                this.salesDataByCounty = [];
                this.salesDataByType = [];
                this.salesDataByMedicalCondition = [];
            })
            .subscribe(salesData => {

                this.processSalesData(salesData);

                this.patientReportService.getSellingData(this.dateRangeSource, 'total').take(1)
                    .subscribe(salesDataTotal => {
                        this.salesTotals = salesDataTotal[0];

                        this.patientReportService.getSellingData(this.dateRangeSource, 'byType').take(1)
                            .subscribe(salesDataByType => {
                                this._salesDataByType = [];

                                salesDataByType.forEach(row => {
                                    this._salesDataByType.push(row);
                                });

                                this.sortByModelByType = new SortBy("category", "asc");

                                this.numPagesOfDataByType = Math.ceil(this._salesDataByType.length / this.limitPerPage);
                                this.pageModelOfDataByType = 0;

                                this.patientReportService.getSellingData(this.dateRangeSource, 'byCounty').take(1)
                                    .subscribe(salesDataByCounty => {
                                        this._salesDataByCounty = [];

                                        salesDataByCounty.forEach(row => {
                                            this._salesDataByCounty.push(row);
                                        });

                                        this.sortByModelByCounty = new SortBy("patientCounty", "asc");

                                        this.numPagesOfDataByCounty = Math.ceil(this._salesDataByCounty.length / this.limitPerPage);
                                        this.pageModelOfDataByCounty = 0;

                                        this.patientReportService.getSellingData(this.dateRangeSource, 'byMedicalCondition').take(1)
                                            .subscribe(salesDataByMedicalCondition => {
                                                this._salesDataByMedicalCondition = [];

                                                salesDataByMedicalCondition.forEach(row => {
                                                    this._salesDataByMedicalCondition.push(row);
                                                });

                                                this.sortByModelByMedicalCondition = new SortBy("patientMedicalCondition", "asc");

                                                this.numPagesOfDataByMedicalCondition = Math.ceil(this._salesDataByMedicalCondition.length / this.limitPerPage);
                                                this.pageModelOfDataByMedicalCondition = 0;
                                            });
                                    });
                                });
                    });
            });

        this.pageOfDataByType.subscribe(countyPage => {
            const offset = this.pageModelOfDataByType * this.limitPerPage;
            this.salesDataByType = this._salesDataByType.slice(offset, offset + this.limitPerPage);
        });

        this.pageOfDataByCounty.subscribe(countyPage => {
            const offset = this.pageModelOfDataByCounty * this.limitPerPage;
            this.salesDataByCounty = this._salesDataByCounty.slice(offset, offset + this.limitPerPage);
        });

        this.pageOfDataByMedicalCondition.subscribe(medicalConditionPage => {
            const offset = this.pageModelOfDataByMedicalCondition * this.limitPerPage;
            this.salesDataByMedicalCondition = this._salesDataByMedicalCondition.slice(offset, offset + this.limitPerPage);
        });
    }

    onClickExport() {
        this.loadingBarService.interval = 100;
        this.loadingBarService.start();

        this.limitPerPage = Math.max(this.numPagesOfDataByCounty * 10, this.numPagesOfDataByMedicalCondition * 10, this.numPagesOfDataByType * 10);

        // -1 will force subscription update
        this.pageModelOfDataByCounty = -1;
        this.pageModelOfDataByType = -1;
        this.pageModelOfDataByMedicalCondition = -1;

        // We need to change width here because in the blob google chart won't be updated
        // Basically this black magic is needed for correctly display google chart svg image
        document['getElementById']('export-container').style.width = '2550px';
        document['getElementById']('aggregate-totals').style.width = '2550px';
        document['getElementById']('line_chart').style.width = '950px';
        window['_forceChartResize']();

        setTimeout(() => {
            const blob = window['getHtmlCloneBlob'](function(w){
                // Code below will be injected into the blob
                w.addEventListener('DOMContentLoaded', function (e) {
                    var el = w.document.getElementById('export-container');

                    el.style.position = 'absolute';
                    el.style.top = 0;
                    el.style.left = 0;
                    el.style.maxWidth = '100%';
                    el.style.zIndex = 999999;
                    el.style.backgroundColor = '#ffffff';

                    function removeElements(elements) {
                        for (var i = 0; i < elements.length; i++) {
                            elements[i].parentElement.removeChild(elements[i]);
                        }
                    }

                    removeElements(w.document.getElementsByTagName('app-pager'));
                    removeElements(w.document.getElementsByTagName('app-left-nav'));
                    removeElements(w.document.getElementsByTagName('app-top-nav'));
                    removeElements(w.document.getElementsByTagName('router-outlet'));
                    removeElements(w.document.getElementsByClassName('left-sidebar'));
                    removeElements(w.document.getElementsByClassName('topbar-controls'));
                    removeElements(w.document.getElementsByClassName('topbar-filters'));
                    removeElements(w.document.getElementsByTagName('app-pager'));

                    // w.document.getElementById('line_chart').style.zoom = '95%';
                });
            });

            // Restore everything
            setTimeout(() => {

                document['getElementById']('export-container').style.width = 'auto';
                document['getElementById']('aggregate-totals').style.width = 'auto';
                document['getElementById']('line_chart').style.width = 'auto';
                window['_forceChartResize']();

                this.limitPerPage = 10;

                // -1 will force subscription update
                this.pageModelOfDataByCounty = -1;
                this.pageModelOfDataByType = -1;
                this.pageModelOfDataByMedicalCondition = -1;

                this.patientReportService.downloadReport({blob}).then((url) => {
                    this.loadingBarService.complete();

                    if (url) {
                        $('<iframe/>').attr({
                            src: url,
                            style: 'visibility:hidden;display:none;'
                        }).appendTo(window.document.body);
                    }
                }).catch(e => {
                    console.error(e);
                    this.loadingBarService.complete();
                });
            }, 200);
        }, 500);
    }

    processSalesData(salesData: Array<any>) {

        this.chartData = [];

        if (salesData && salesData.length) {
            salesData.forEach(row => {

                const dataPoint = [];
                const day = moment(row.reportDate);
                const tooltip = `
                    <div style="padding: 15px; font-size: medium"><span class="font-size: 0.8em">
                    <b>${day.format('YYYY-MM-DD')}</b> <br /><br />
                    Patients: <b>${(row.totalPatients)}</b><br />
                    Transactions: <b>${(row.totalTransactions)}</b><br />
                    Revenue: <b>${this.formatDollarsAmount(row.totalRevenue)}</b><br />
                    </span></div>
                `;

                dataPoint.push(day.toDate());

                dataPoint.push(row.totalPatients);
                dataPoint.push(tooltip);
                dataPoint.push(row.totalTransactions);
                dataPoint.push(tooltip);
                dataPoint.push(row.totalRevenue);
                dataPoint.push(tooltip);

                this.chartData.push(dataPoint);
            });
        }

        if (this.chartData.length) {
            this.chartData.unshift([
                'Day',
                'Patients',
                {type: 'string', role: 'tooltip', 'p': {'html': true}},
                'Transactions',
                {type: 'string', role: 'tooltip', 'p': {'html': true}},
                'Revenue',
                {type: 'string', role: 'tooltip', 'p': {'html': true}}
            ]);
        }

        this.chartOptions.hAxis.gridlines.count = Math.min(this.chartData.length, 15);
    }

    formatDollarsAmount(dollars): String {
        return formatCurrency(dollars, { format: '%s%v', code: 'USD', symbol: '$' });
    }

    dynamicSort(property: SortBy) {

        const sortField = property.sortBy;
        const sortOrder = property.direction === 'asc' ? 1 : -1;

        return function(value1, value2) {
            // Need to return 1 or 0
            // Total row is always last
            if (value2.name === 'Total') {
                return -1;
            }

            if (value1.name === 'Total') {
                return 1;
            }

            let sort1;
            let sort2;

            if (sortField === 'average') {
                // Need to compute separately
                sort1 = (value1['sum'] / value1['count']);
                sort2 = (value2['sum'] / value2['count']);
            } else if (typeof value1[sortField] === 'string') {

                sort1 = value1[sortField].toLowerCase();
                sort2 = value2[sortField].toLowerCase();

                // Empty string should be the last
                if (sort1 == "") {
                    sort1 = "~~~~~";
                }

                if (sort2 == "") {
                    sort2 = "~~~~~";
                }

            } else {
                sort1 = value1[sortField];
                sort2 = value2[sortField];
            }

            const result = (sort1 < sort2) ? -1 : (sort1 > sort2) ? 1 : 0;

            return result * sortOrder;
        };
    }
}
