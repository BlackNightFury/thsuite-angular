export function didSet(callback: (any) => void) {
    return function (target: Object, name: string): any {

        let value: any;

        return {
            get: function() {
                return value;
            },
            set: function(newValue) {
                value = newValue;

                callback.call(this, value);
            },
            enumerable: true,
            configurable: true
        };
    };
}
