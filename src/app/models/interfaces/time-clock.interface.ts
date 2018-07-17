import {ICommon} from "./common.interface";
import {IUser} from "./user.interface";

export interface ITimeClock extends ICommon{

    userId: string;
    User?: IUser;

    clockIn: Date;
    clockOut: Date;

    autoClockedOut: boolean;

    // Virtual
    clockInAtStoreTimezone?: Date;
    clockOutAtStoreTimezone?: Date;
}
