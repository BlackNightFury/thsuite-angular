import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'arrayMultiply'})
export class ArrayMultiplyPipe implements PipeTransform {
    transform(value: number[], next: number[]): number[] {
        return value.map((x,i) => {
            return next[i] * x;
        });
    }
}
