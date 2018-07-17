import {ISavedCart} from "./interfaces/saved-cart.interface";
export class SavedCart implements ISavedCart {
    id: string;
    version: number;
    patientId: string;
    patientQueueId: string;
    cartData: string;

    constructor(obj: ISavedCart) {
        Object.assign(this, obj);
    }


}
