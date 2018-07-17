import {ICommon} from "./common.interface";

export interface IAlert extends ICommon {

    title: string;
    description: string;
    url: string;
    type: string;

    createdAt: Date;

    readonly typeFormatted: string;

}
