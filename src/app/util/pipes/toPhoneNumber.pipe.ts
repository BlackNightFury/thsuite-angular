import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'toPhoneNumber'})
export class ToPhoneNumberPipe implements PipeTransform {
    transform(value: string):any {

        if(!value) return "";

        var formattedPhoneNumber = "";

        if(value.length < 4) return value
        
        formattedPhoneNumber += "(" + value.substring(0, 3) + ") ";

        if(value.length >= 6){
            formattedPhoneNumber += value.substring(3,6);         
        } else {
            formattedPhoneNumber += value.substring(3,value.length);  
        }

        if(value.length < 7) return formattedPhoneNumber;

        formattedPhoneNumber += "-" + value.substring(6,value.length);

        return formattedPhoneNumber;
    }
}