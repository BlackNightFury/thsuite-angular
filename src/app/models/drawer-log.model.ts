import {IDrawerLog} from "./interfaces/drawer-log.interface";

export class DrawerLog implements IDrawerLog {
    id: string;
    version: number;

    drawerId: string;

    createdAt: Date;
    event: string;

    constructor(obj: IDrawerLog) {
        Object.assign(this, obj);
    }
}
