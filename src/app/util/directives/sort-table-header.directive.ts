import {Component, Directive, forwardRef, HostBinding, HostListener, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

export class SortBy {
    constructor(public sortBy: string, public direction: 'asc'|'desc') {

    }
}

@Directive({
    selector: 'th[sortBy]',
    // templateUrl: './sort-table-header.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SortTableHeaderDirective),
            multi: true
        }
    ]
})
export class SortTableHeaderDirective implements OnInit, ControlValueAccessor {

    @Input() sortBy: string;

    private _direction: 'asc'|'desc'|undefined;

    set direction(value: 'asc'|'desc'|undefined) {
        this._direction = value;

        this.isAscDirection = value == 'asc';
        this.isDescDirection = value == 'desc';
    }
    get direction() {
        return this._direction;
    }

    @HostBinding('class.asc') isAscDirection = false;
    @HostBinding('class.desc') isDescDirection = false;

    private changeHandler = (_: any) => {};

    constructor() {
    }

    ngOnInit() {
    }

    writeValue(obj: any): void {
        if(obj && obj.sortBy == this.sortBy) {
            this.direction = obj.direction;
        }
        else {
            this.direction = undefined;
        }
    }

    registerOnChange(fn: any): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    @HostListener('click')
    sort() {
        if(!this.direction) {
            this.direction = 'asc';
            this.changeHandler(new SortBy(this.sortBy, this.direction));
        }
        else if(this.direction == 'asc') {
            this.direction = 'desc';
            this.changeHandler(new SortBy(this.sortBy, this.direction));
        }
        else if(this.direction == 'desc') {
            this.direction = undefined;
            this.changeHandler(undefined);
        }
    }
}
