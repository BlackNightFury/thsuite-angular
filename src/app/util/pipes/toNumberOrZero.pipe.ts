import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'toNumberOrZero'})
export class ToNumberOrZeroPipe implements PipeTransform {
    transform(value: string):any {
        let retNumber = Number(value);
        return isNaN(retNumber) ? 0 : retNumber;
    }
}