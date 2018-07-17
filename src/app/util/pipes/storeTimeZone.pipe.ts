import {Pipe, PipeTransform} from "@angular/core";
import * as moment from 'moment-timezone'

@Pipe({name: 'storeTimeZone'})
export class StoreTimeZonePipe implements PipeTransform {
    transform(value: string,storeTimeZone: string, formatType: string) {
        const date = moment.utc(value).tz(storeTimeZone)
       
        return formatType === 'short'
            ? date.format('M/D/YYYY, h:mm A')
            : formatType === 'shortTime'
                ? date.format('h:mm A')
                : formatType === 'shortDate'
                    ? date.format('M/d/YY')
                    : date.format()
    }
}
