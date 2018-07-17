import {ICommon} from "./common.interface";

export interface ITax extends ICommon {

    name: string;

    percent: number;

    appliesToCannabis: boolean;
    appliesToNonCannabis: boolean;
}
