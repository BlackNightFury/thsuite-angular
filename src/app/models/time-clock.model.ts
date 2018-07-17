import {ITimeClock} from "./interfaces/time-clock.interface";
import {IUser} from "./interfaces/user.interface";
export class TimeClock implements ITimeClock{
    id: string;
    version: number;

    userId: string;
    User?: IUser;

    clockIn: Date;
    clockOut: Date;

    autoClockedOut: boolean;

    constructor(obj?: ITimeClock){
        Object.assign(this, obj);
    }
}
