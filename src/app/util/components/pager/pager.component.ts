import {Component, forwardRef, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import * as _ from "underscore";
import { isNumber } from "ngx-pipes/src/app/pipes/helpers/helpers";
declare const $: any;

@Component({
    selector: 'app-pager',
    templateUrl: './pager.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PagerComponent),
            multi: true
        }
    ]
})
export class PagerComponent implements OnInit, ControlValueAccessor {

    private changeHandler = (_: any) => {};

    private _numPages: number;
    private _displayCount = 9;
    @Input() set numPages(value: number) {
        this._numPages = value;
    }

    get numPages() {
        return this._numPages;
    }

    get pages() {

        if (this.currentPage < this._displayCount) {
            if (this._numPages > this._displayCount) {
                return _.range(this._displayCount + 1);
            } else {
                return _.range(this._numPages);
            }
        }

        //this allows a way to jump back and forth sets of pages
        if (this._numPages >= this._displayCount + 1) {
            let lowerPadding = this.currentPage % this._displayCount;
            let upperPadding = this._displayCount - lowerPadding + 1;

            let upperBound = this.currentPage + upperPadding;
            if (upperBound > this._numPages) {
                upperBound = this._numPages;
            }

            return _.range(this.currentPage - 1 - lowerPadding, upperBound);
        }
    }

    currentPage: number = 0;

    @Output() goToPage: EventEmitter<number> = new EventEmitter<number>();

    onPageClick(page, $e) {
        this.currentPage = page;
        this.changeHandler(this.currentPage);

        const whereToScrollMainPage = $($e.target).parents('.table-pagination').parent().prev().offset().top;
        var whereToScrollModal = null;
        var modalOpen = false;
        if ($("main:last").hasClass("modal-pagination-possible")) {
            whereToScrollModal = $("main:last").position().top;
            modalOpen = true;
        }

        console.log("Main Scroll: " + whereToScrollMainPage.toString());
        console.log(modalOpen ? "Modal Scroll: " + whereToScrollModal.toString() : "Modal Not Open.");

        /* whether modal is open or not */
        if (isNumber(whereToScrollMainPage)) {
            $("html, body").animate({ scrollTop: whereToScrollMainPage - 200 + "px" });
        }
        /* modal open so also scroll to top of modal */
        if (modalOpen && isNumber(whereToScrollModal)){
            $(".ui-widget-content").animate({ scrollTop: whereToScrollModal + "px" })
        }
    }

    writeValue(obj: any): void {
        let validPage =  (obj >= 0) && (obj < this._numPages);

        this.currentPage = obj;
    }

    registerOnChange(fn: any): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    constructor() {
    }

    ngOnInit() {
    }

}
