import {Component, forwardRef, Input, OnInit, ViewChild} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import * as moment from "moment";

declare const $;

@Component({
    selector: 'app-time-picker',
    templateUrl: './time-picker.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TimePickerComponent),
            multi: true
        }
    ]
})
export class TimePickerComponent implements OnInit, ControlValueAccessor {

    @ViewChild('input') element;

    @Input() placeholder: string;

    selectedValue: string;

    private changeHandler = (_: any) => {};

    constructor() {
    }

    ngOnInit() {

        let $el = $(this.element.nativeElement);

        $el.timepicker({
            'timeFormat': 'g:ia'
        });

        $el.on('selectTime', (event) => {
            this.changeHandler(moment($el.val(), 'h:mma').toDate())
        });
    }

    writeValue(obj: any): void {
        $(this.element.nativeElement).timepicker('setTime', obj);
    }

    registerOnChange(fn: any): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setSelectedValue(value: string) {
        this.selectedValue = value;
        this.changeHandler(value);
    }
}
