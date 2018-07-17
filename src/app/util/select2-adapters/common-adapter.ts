import {CommonService} from "../../services/common.service";
import {IBarcode} from "../../models/interfaces/barcode.interface";
import {ICommon} from "../../models/interfaces/common.interface";
import {Observable} from "rxjs";
import {SearchableService} from "../../services/searchable.service";

declare var $;

export function CommonAdapter<T extends ICommon>(service: CommonService<T> & SearchableService<T>, id: keyof T, text: (keyof T|((T) => string)), extraSearchArgs: any = {}): Promise<any> {

    let textFunction: (T) => string;

    if(typeof text == 'function') {
        textFunction = <(T) => string>text;
    }
    else {
        textFunction = (obj) => obj[text];
    }

    return new Promise(resolve => {
        $.fn.select2.amd.require(["select2/data/array", "select2/utils"],
            (ArrayData, Utils) => {
                const CommonAdapter = function CommonAdapter($element, options) {
                    CommonAdapter['__super__'].constructor.call(this, $element, options)
                };
                Utils.Extend(CommonAdapter, ArrayData);

                let lastCurrentValSorted = [];
                let lastCurrentResults = [];

                CommonAdapter.prototype.current = function(callback) {
                    let currentVal = this.$element.val();

                    if(!currentVal) {
                        currentVal = [];
                    }
                    else if(!Array.isArray(currentVal)) {
                        currentVal = [currentVal];
                    }

                    if(!currentVal || !currentVal.length) {
                        return callback([])
                    }


                    let currentValSorted = currentVal.slice().sort();
                    if(currentValSorted.length == lastCurrentResults.length) {
                        let isEqual = true;
                        for(let i = 0; i < currentValSorted.length; i++) {
                            if(currentValSorted[i] !== lastCurrentValSorted[i]) {
                                isEqual = false;
                                break;
                            }
                        }

                        if(isEqual) {
                            return callback(lastCurrentResults);
                        }
                    }


                    Observable.combineLatest(currentVal.map(id => service.get(id)))
                        .take(1)
                        .toPromise()
                        .then((results: T[]) => {
                            lastCurrentValSorted = currentValSorted;
                            lastCurrentResults = results.map(item => {
                                return {
                                    id: item[id],
                                    text: textFunction(item)
                                }
                            });

                            callback(lastCurrentResults);
                        })
                };

                CommonAdapter.prototype.query = function(params, callback) {
                    console.log(extraSearchArgs);
                    let page = (params.page || 0);
                    let totalPages;

                    service.search(params.term || '', page, undefined, extraSearchArgs)
                        .flatMap(results => {
                            totalPages = results.totalPages;

                            if(!results.objects.length) {
                                return Observable.of([]);
                            }

                            return Observable.combineLatest(results.objects).take(1);
                        })
                        .take(1)
                        .toPromise()
                        .then((results: T[]) => {
                            callback({
                                results: results.map(item => {
                                    return {
                                        id: item[id],
                                        text: textFunction(item)
                                    }
                                }),
                                pagination: {
                                    more: page + 1 < totalPages
                                }
                            })
                        });
                };

                console.log(extraSearchArgs,CommonAdapter.prototype.query)
                return resolve(CommonAdapter);
            }
        );
    })
}
