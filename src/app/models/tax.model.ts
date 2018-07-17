import {ITax} from "./interfaces/tax.interface";

export class Tax implements ITax{

    id: string;
    version: number;

    name: string;

    percent: number;
    // cannabisOnly: boolean;

    appliesToCannabis: boolean;
    appliesToNonCannabis: boolean;

    constructor(obj: ITax) {
        Object.assign(this, obj);
    }

}
