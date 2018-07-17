import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter, forwardRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    Renderer,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

import {Select2OptionData} from "./select2.interface";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

declare var jQuery;

@Component({
    selector: 'app-select2',
    template: `
        <select #selector>
        </select>`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => Select2Component),
            multi: true
        }
    ]
})
export class Select2Component implements AfterViewInit, OnChanges, OnDestroy, OnInit, ControlValueAccessor {
    @ViewChild('selector') selector: ElementRef;

    // enable / disable default style for select2
    @Input() cssImport: boolean = false;

    // width of select2 input
    @Input() width: string;

    @Input() data: Select2OptionData[];

    @Input() dataAdapter: any;

    // enable / disable select2
    @Input() disabled: boolean = false;

    @Input() searchPlaceholder: string;

    @Input() renderOptionsAsHTML: boolean = false;

    // all additional options
    @Input() options: Select2Options;

    @Input() searchFormatter: (string) => string;

    @Output('select') onSelect = new EventEmitter<any>();

    private element: JQuery = undefined;
    private check: boolean = false;

    constructor(private renderer: Renderer) { }

    ngOnInit() {
        if(this.cssImport) {
            const head = document.getElementsByTagName('head')[0];
            const link: any = head.children[head.children.length-1];

            if(!link.version) {
                const newLink = this.renderer.createElement(head, 'style');
                this.renderer.setElementProperty(newLink, 'type', 'text/css');
                this.renderer.setElementProperty(newLink, 'version', 'select2');
                this.renderer.setElementProperty(newLink, 'innerHTML', this.style);
            }

        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if(!this.element) {
            return;
        }

        if(changes['disabled'] && changes['disabled'].previousValue !== changes['disabled'].currentValue) {
            this.renderer.setElementProperty(this.selector.nativeElement, 'disabled', this.disabled);
        }
    }

    ngAfterViewInit() {
        this.element = jQuery(this.selector.nativeElement);

        if(this.valueOnInit) {
            this.setElementValue(this.valueOnInit);
            this.valueOnInit = undefined;
        }

        this.initPlugin();

        this.element.on('select2:select select2:unselect', (e) => {

            if(e.type == 'select2:unselect' && !this.element.is('[multiple]')) {
                this.setElementValue('');
            }

            this.changeHandler(this.element.val());
            this.onSelect.emit(this.element.val());
        });

        this.element.on('select2:open', (e) => {

            $(document).on('keyup', '.select2-search__field', (e: any) => {
                if(this.searchFormatter){
                    e.target.value = this.searchFormatter(e.target.value);
                }
            })
            
            $(".select2-search--dropdown .select2-search__field").attr("placeholder", this.searchPlaceholder);
        });

        this.element.on('select2:close', (e) => {

            $(document).off('keyup', '.select2-search__field');

            $(".select2-search--dropdown .select2-search__field").attr("placeholder", null);
        });
    }

    ngOnDestroy() {
        this.element && this.element.off("select2:select");
    }

    private initPlugin() {
        if(!this.element.select2) {
            if(!this.check) {
                this.check = true;
                console.log("Please add Select2 library (js file) to the project. You can download it from https://github.com/select2/select2/tree/master/dist/js.");
            }

            return;
        }

        // If select2 already initialized remove him and remove all tags inside
        if (this.element.hasClass('select2-hidden-accessible') == true) {
            this.element.select2('destroy');
            this.renderer.setElementProperty(this.selector.nativeElement, 'innerHTML', '');
        }

        let options: Select2Options = {
            data: this.data,
            width: (this.width) ? this.width : 'resolve'
        }

        if(this.renderOptionsAsHTML) {
            var renderHTML = function(d) { 
                var dHMTL = $(d.text);

                if(dHMTL.length){
                    return dHMTL; 
                } else {
                    return d.text;
                }          
            }

            options.templateResult = renderHTML;
            options.templateSelection = renderHTML;
        }

        options['dataAdapter'] = this.dataAdapter;

        Object.assign(options, this.options);

        this.element.select2(options);

        this.element.on('select2:unselecting', function() {
            $(this).data('unselecting', true);
        }).on('select2:opening', function(e) {
            if ($(this).data('unselecting')) {
                $(this).removeData('unselecting');
                e.preventDefault();
            }
        });

        if(this.disabled) {
            this.renderer.setElementProperty(this.selector.nativeElement, 'disabled', this.disabled);
        }
    }

    private valueOnInit: any;

    private setElementValue (newValue: string | string[]) {

        if(!this.element) {
            this.valueOnInit = newValue;
            return;
        }

        if(!newValue || (Array.isArray(newValue) && newValue.length == 0)) {
            let found = false;
            for (let option of this.selector.nativeElement.options) {
                if (!option.value) {
                    found = true;
                    this.renderer.setElementProperty(option, 'selected', 'true');
                }
                else {
                    this.renderer.setElementProperty(option, 'selected', 'false');
                }
            }

            //Note: If single selects are being wonky, this might be the problem
            //This was removed because multi-selects were getting filled with weird empty option
            // if(!found) {
            //     this.element.append($('<option>').attr('value', '').prop('selected', true));
            // }
        }


        if(Array.isArray(newValue)) {
            for(let value of newValue) {
                let found = false;
                for (let option of this.selector.nativeElement.options) {
                    if (option.value == value) {
                        found = true;
                        this.renderer.setElementProperty(option, 'selected', 'true');
                        break;
                    }
                }
                if(!found) {
                    this.element.append($('<option>').attr('value', value).prop('selected', true));
                }
            }

        } else {

            let found = false;
            for (let option of this.selector.nativeElement.options) {
                if (option.value == newValue) {
                    found = true;
                    this.renderer.setElementProperty(option, 'selected', 'true');
                    break;
                }
            }
            if(!found) {
                this.element.append($('<option>').attr('value', newValue).prop('selected', true));
            }
            this.renderer.setElementProperty(this.selector.nativeElement, 'value', newValue);
        }

        this.element.trigger('change.select2');
    }

    private style: string = `CSS`;

    private changeHandler = (_: any) => {};

    writeValue(obj: any): void {
        console.log("Select2 newValue");
        this.setElementValue(obj);
    }

    registerOnChange(fn: any): void {
        this.changeHandler = function(newValue) {
            console.log("Select2 didChange");

            fn(newValue);
        };
    }
    registerOnTouched(fn: any): void {
    }
}
