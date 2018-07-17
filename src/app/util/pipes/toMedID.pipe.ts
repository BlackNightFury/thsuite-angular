import {Pipe, PipeTransform, Injectable} from "@angular/core";
import {environment} from '../../../environments/environment';

@Injectable()
@Pipe({name: 'toMedID'})
export class ToMedIDPipe implements PipeTransform {

    transform(value: string):any {

        let formattedMedID = value.replace(/[^a-zA-Z0-9]/g, '');

        let regex = new RegExp(environment.medicalIdRegex, 'g');

        if(!value.match(regex)){
            return value;
        }

        return value.match(regex).join(environment.medicalIdSeparator);
    }
}