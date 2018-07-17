import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'mapValues'})
export class MapValuesPipe implements PipeTransform {
    transform(value: any, args?: any[]): Object[] {
        let returnArray = [];

        console.log(value);

        value.forEach((entryVal, entryKey) => {
            console.log(entryKey);

            returnArray.push({
                key: entryKey,
                val: entryVal
            });
        });

        console.log(returnArray);

        return returnArray;
    }
}
