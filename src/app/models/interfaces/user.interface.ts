import {ICommon} from "./common.interface";
import {IPermission} from "./permission.interface";
import {IStore} from "./store.interface";
import {IEmailSettings} from "./email-settings.interface";

export interface IUser extends ICommon {
    storeId: string;
    clientId: string;
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
}
