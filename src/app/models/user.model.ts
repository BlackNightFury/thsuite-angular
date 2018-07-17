import {IUser} from "./interfaces/user.interface";
import {IPermission} from "./interfaces/permission.interface";
import {IStore} from "./interfaces/store.interface";
import {IEmailSettings} from "./interfaces/email-settings.interface";

export class User implements IUser {
    id: string;
    version: number;

    clientId: string;
    storeId: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    pin?: string;
    posPin?: string;
    phone: string;
    licenseNumber: string;

    dob: Date;
    gender: string;
    badgeId: string;
    badgeExpiration: Date;
    stateId: string;
    stateIdExpiration: Date;

    type: string;

    status: number;
    activation: string;

    image: string;

    Permissions?: IPermission;
    Store?: IStore;
    EmailSettings?: IEmailSettings;

    isAPIUser: boolean;
    isActive: boolean;

    constructor(obj: IUser) {
        Object.assign(this, obj);
    }
}
