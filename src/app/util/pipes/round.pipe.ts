import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'round'})
export class RoundPipe implements PipeTransform {

    // Pass 10, 100, 1000, etc. to round to the 10th, 100th, 1000th, etc.
    transform(value: any, round: number = 100) {
        return Math.round(parseFloat(value) * round) / round;
    }
}
