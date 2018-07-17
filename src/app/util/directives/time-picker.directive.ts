import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from "@angular/core";
import * as moment from "moment";

declare const $: any;

@Directive({
    selector: '[app-time-picker]',
})
export class TimePickerDirective implements OnInit {

    @Input('ngModel')        ngModel: any;
    @Output('ngModelChange') ngModelChange = new EventEmitter();

    constructor(private el: ElementRef) {

    }

    ngOnInit(): void {

        let $el = $(this.el.nativeElement);


        console.log("time picker");
        console.log($(this.el));
        console.log($(this.el.nativeElement));
        console.log($(this.el.nativeElement).value);


        let initialValue = $el.val();
        if(initialValue) {
            // console.log("time picker");
            // console.log(initialValue);
            $el.val(moment(initialValue, 'HH:mm:ss').format('h:mma'));
        }
//comment
        $el.timepicker({
            // 'timeFormat': 'g:ia'
        });

        $el.on('selectTime', (event) => {
            this.ngModel = moment($el.val(), 'h:mma').toDate();
            this.ngModel.toString = () => { return $el.val() };
            this.ngModelChange.emit(this.ngModel);
        });
    }
}
