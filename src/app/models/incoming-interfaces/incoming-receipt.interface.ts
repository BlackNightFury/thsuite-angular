import {ICommon} from "app/models/interfaces/common.interface";
import {IStore} from "../interfaces/store.interface";
import {ILineItem} from "../interfaces/line-item.interface";
import {IUser} from "../interfaces/user.interface";
import {IPatient} from "../interfaces/patient.interface";
import {IDrawer} from "../interfaces/drawer.interface";
import {ICaregiver} from "../interfaces/caregiver.interface";

export interface IIncomingReceipt extends ICommon{
    storeId: string;
    Store?: IStore;

    barcode: string;

    LineItems?: ILineItem[];

    userId: string;
    User?: IUser;

    patientId: string;
    Patient?: IPatient;

    caregiverId?: string;
    Caregiver?: ICaregiver;

    paymentMethod: string;
    giftcardTransactionId: string;

    transactionTime: number;

    createdAt: Date;

    drawerId?: string;
    Drawer?: IDrawer;

    amountPaid: number;
}
