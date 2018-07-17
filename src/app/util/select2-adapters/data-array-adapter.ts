import {Observable} from "rxjs";

declare var $;

export function DataArrayAdapter(){

    return new Promise(resolve => {
        $.fn.select2.amd.require(["select2/data/array", "select2/utils"],
            (ArrayData, Utils) => {

                const DataArrayAdapter = function DataArrayAdapter($element, options) {
                    DataArrayAdapter['__super__'].constructor.call(this, $element, options)
                    this._data = [];
                };
                Utils.Extend(DataArrayAdapter, ArrayData);

                // DataArrayAdapter.prototype.data = [];

                DataArrayAdapter.prototype.setArrayData = function(data){
                    this._data = data;
                };

                let lastCurrentValSorted = [];
                let lastCurrentResults = [];

                DataArrayAdapter.prototype.current = function(callback){
                    console.log("CURRENT");
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

                    lastCurrentResults = currentVal.map(id => {
                        for(let item of this._data){
                            if(item.id == id){
                                return item;
                            }
                        }
                    });

                    lastCurrentValSorted = currentValSorted;

                    callback(lastCurrentResults);

                }

                DataArrayAdapter.prototype.query = function(params, callback){
                    console.log("QUERY");
                    let term = params.term;

                    let results = [];

                    if(term) {
                        for (let item of this._data) {
                            if (item.text.indexOf(term) !== -1) {
                                results.push(item);
                            }
                        }
                    }else{
                        results = this._data;
                    }

                    callback({
                        results: results
                    });
                }

                return resolve(DataArrayAdapter);

            }
        );
    });



}
