import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'average'})
export class AveragePipe implements PipeTransform {
    transform(value: number[], args?: any[]): number {
        return (value.reduce((a,b) => a + b, 0) / value.length)
    }
}
