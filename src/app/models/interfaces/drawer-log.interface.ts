import {ICommon} from "./common.interface";

export interface IDrawerLog extends ICommon {

    drawerId: string;

    event: string;
    createdAt: Date;
}
