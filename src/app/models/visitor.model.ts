import {IVisitor} from "./interfaces/visitor.interface";

export class Visitor implements IVisitor {
    id: string;
    version: number;

    firstName: string;
    lastName: string;

    clockIn: Date;
    clockOut: Date;

    autoClockedOut : boolean;

    visitReason: string;
    idImage: string;
    signature: string;

    constructor(obj: IVisitor) {
        Object.assign(this, obj);
    }
}
