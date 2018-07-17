import {Component, forwardRef, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ButtonTogglerOption} from "../button-toggler/button-toggler.component";

class ButtonTogglerOptionWithSelected {
    constructor(public value: ButtonTogglerOption, public selected: boolean) {

    }
}

@Component({
    selector: 'app-button-toggler[multiple]',
    templateUrl: './multi-button-toggler.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ButtonTogglerMultipleComponent),
            multi: true
        }
    ]
})
export class ButtonTogglerMultipleComponent implements OnInit, ControlValueAccessor {

    _options: ButtonTogglerOptionWithSelected[];


    @Input() set options(value: ButtonTogglerOption[]) {
        this._options = value.map(option => new ButtonTogglerOptionWithSelected(option, false));
    };

    private changeHandler = (_: any) => {};

    constructor() {
    }

    ngOnInit() {
    }

    writeValue(obj: any): void {
        for(let option of this._options) {
            option.selected = !!obj && (obj.indexOf(option.value.value) != -1);
        }
    }

    registerOnChange(fn: any): void {
        this.changeHandler = fn;
    }

    registerOnTouched(fn: any): void {
    }

    toggleValue(option: ButtonTogglerOptionWithSelected) {

        option.selected = !option.selected;
        this.changeHandler(this._options.filter(opt => opt.selected).map(opt => opt.value.value));
    }
}
