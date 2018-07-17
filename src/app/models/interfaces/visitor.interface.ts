import {ICommon} from "./common.interface";

export interface IVisitor extends ICommon {

    firstName: string;
    lastName: string;

    clockIn: Date;
    clockOut: Date;

    autoClockedOut: boolean;

    visitReason: string;
    idImage: string;
    signature:string;
}
