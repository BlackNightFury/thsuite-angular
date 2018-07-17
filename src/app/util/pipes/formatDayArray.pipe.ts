import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'formatArray'})
export class FormatArrayPipe implements PipeTransform {
    transform(value: string[], defaultLabel: string): string {
        return value.length ? value.map(d => d[0].toUpperCase() + d.slice(1)).join(', ') : defaultLabel;
    }
}
