import {ITag} from "./interfaces/tag.interface";

export class Tag implements ITag{
    id: string;
    version: number;

    value: string;
    storeId: string;

    constructor(obj?: ITag){
        Object.assign(this, obj);
    }
}
