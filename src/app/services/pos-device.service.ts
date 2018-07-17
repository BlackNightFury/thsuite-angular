import {CommonService} from "./common.service";
import {IPosDevice} from "../models/interfaces/pos-device.interface";
import {Injectable, Injector} from "@angular/core";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {PosDevice} from "../models/pos-device.model"
import * as uuid from "uuid";
@Injectable()
export class PosDeviceService extends CommonService<IPosDevice>{

    constructor(injector: Injector){
        super(injector, 'pos-devices');
    }

    newInstance(){
        return new PosDevice({
            id: uuid.v4(),
            version: 0,

            userId: ''
        });
    }

    dbInstance(fromDb: IPosDevice){
        return new PosDevice(fromDb);
    }

    instanceForSocket(object: IPosDevice) {
        return {
            id: object.id,
            version: object.version,

            userId: object.userId
        }
    }
}
