import {Directive, HostListener, Output, EventEmitter} from '@angular/core';

// Prevents from typing too fast so barcode scanner would fail
@Directive({
    selector: '[preventBarcodeScanner]'
})
export class PreventBarcodeScannerDirective {

    @Output()
    ngModelChange: EventEmitter<any> = new EventEmitter();

    private lastKeyDown = 0;

    // Extremely unlikely that person will type faster than 1 key per 50ms
    private keyDownThresholdMs = 50;

    @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
        const now = new Date().getTime();

        if ((now - this.lastKeyDown) < this.keyDownThresholdMs) {
            event.preventDefault();
            this.ngModelChange.emit('');

            return;
        }

        this.lastKeyDown = now;
    }
}
