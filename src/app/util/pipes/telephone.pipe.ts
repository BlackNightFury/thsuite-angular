import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'telephone'})
export class TelephonePipe implements PipeTransform {
    transform(telephone_string) {
        var digits = (""+telephone_string).replace(/\D/g, '');
        var parts = digits.match(/^(\d{3})(\d{3})(\d{4})$/);
        return (!parts) ? telephone_string : "(" + parts[1] + ") " + parts[2] + "-" + parts[3];
    }
}
