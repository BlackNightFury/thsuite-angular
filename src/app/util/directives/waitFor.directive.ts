import {Directive, EmbeddedViewRef, Input, OnDestroy, TemplateRef, ViewContainerRef} from "@angular/core";

class WaitForContext {
    public $implicit: any = null;
}

@Directive({selector: '[vWaitFor]'})
export class WaitForDirective implements OnDestroy {

    private _context = new WaitForContext();
    private _viewRef: EmbeddedViewRef<WaitForContext>;

    private showingView = false;

    constructor(private _templateRef: TemplateRef<WaitForContext>,
                private _viewContainer: ViewContainerRef) {

    }

    private _observable;
    private _subscription;
    private _gotFirstEmit = false;

    @Input() set vWaitFor(value: any) {
        this._observable = value;

        this._subscription = this._observable.subscribe(emittedValue => {
            let isFirstEmit = !this._gotFirstEmit;
            this._gotFirstEmit = true;

            this._context.$implicit = emittedValue;
            if (isFirstEmit) {
                this._viewRef = this._viewContainer.createEmbeddedView(this._templateRef, this._context)
            }
        })

    }


    ngOnDestroy(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
