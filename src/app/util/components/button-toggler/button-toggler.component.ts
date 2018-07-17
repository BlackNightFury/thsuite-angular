import {Component, forwardRef, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

export class ButtonTogglerOption {
    constructor(public value: string, public label: string) {

    }
}

class ButtonTogglerOptionWithSelected {
    constructor(public value: ButtonTogglerOption, public selected: boolean) {

    }
}

@Component({
    selector: 'app-button-toggler:not([multiple])',
    templateUrl: './button-toggler.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ButtonTogglerComponent),
            multi: true
        }
    ]
})
export class ButtonTogglerComponent implements OnInit, ControlValueAccessor {

    @Input() options: ButtonTogglerOption[];

    @Input('optional') isOptional: boolean = false;

    @Input() allowClear: boolean = false;

    //This option adds a big margin-right to the last button, prevents overlaps on smaller screens
    @Input() noOverlap: boolean = false;

    @Input() height: number = -1;

    @Input() fontSize: number = -1;

    @Input() disabled: boolean = false;

    selectedValue: string;

    private changeHandler = (_: any) => {};

    constructor() {
    }

    ngOnInit() {
    }

    writeValue(obj: any): void {

        let option = this.options.find(option => option.value == obj);

        if(option) {
            this.selectedValue = obj;
        }
        else if(!this.isOptional) {
            this.selectedValue = this.options[0].value;
            this.changeHandler(this.selectedValue);
        }
        else {
            this.selectedValue = undefined;
        }
    }

    registerOnChange(fn: any): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setSelectedValue(value: string) {

        if(this.disabled) return;

        if(this.isOptional && this.allowClear && this.selectedValue == value) {
            this.selectedValue = undefined;
            this.changeHandler(undefined);
        }
        else {
            this.selectedValue = value;
            this.changeHandler(value);
        }
    }
}
