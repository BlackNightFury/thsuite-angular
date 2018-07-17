import {ICommon} from "./common.interface";
import {ITransfer} from "./transfer.interface";

export interface IDelivery extends ICommon {
    transferId: string;
    Transfer?: ITransfer;

    MetrcId: number;

    RecipientFacilityName: string;
}
