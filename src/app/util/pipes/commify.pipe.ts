import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'commify'})
export class CommifyPipe implements PipeTransform {
    transform(value: string|number) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}
