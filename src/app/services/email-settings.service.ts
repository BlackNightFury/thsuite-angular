
import {IEmailSettings} from "../models/interfaces/email-settings.interface";
import {SocketService} from "../lib/socket";
import {Router} from "@angular/router";
import {CommonService} from "./common.service";
import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {EmailSettings} from "../models/email-settings.model";
import {ObjectObservable} from "../lib/object-observable";
@Injectable()
export class EmailSettingsService extends CommonService<IEmailSettings> {

    constructor(injector: Injector) {
        super(injector, 'email-settings');
    }

    dbInstance(fromDb: IEmailSettings) {
        return new EmailSettings(fromDb);
    }

    newInstance(): IEmailSettings {
        throw new Error("EmailSettings object cannot be created on frontend");
    }

    instanceForSocket(object: IEmailSettings) {
        return {
            id: object.id,
            version: object.version,

            userId: object.userId,

            lowInventory: object.lowInventory,
            autoClosedPackages: object.autoClosedPackages,

            taxesReport: object.taxesReport
        }
    }

    getByUserId(userId: string): Observable<IEmailSettings> {

        let result = new Subject<IEmailSettings>();

        this.socket.emitPromise('getByUserId', userId)
            .then(emailSettingsId => {
                if(!emailSettingsId) return result.next(null)
                this.get(emailSettingsId)
                    .subscribe(result);
            })
            .catch(err => {
                console.log('err: ');
                console.log(err);
            });

        return result.asObservable();

    }
}
