import {Injectable, Injector} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import * as uuid from "uuid";
import {SearchResult} from "../lib/search-result";
import {SocketService} from "../lib/socket";
import {ObjectObservable} from "../lib/object-observable";
import {Router} from "@angular/router";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPackageUnusedLabel} from "../models/interfaces/package-unused-label.interface";
import {PackageUnusedLabel} from "../models/package-unused-label.model";
import {SearchableService} from "./searchable.service";

@Injectable()
@Mixin([SearchableService])
export class PackageUnusedLabelService extends CommonService<IPackageUnusedLabel> implements SearchableService<IPackageUnusedLabel> {

    constructor(injector: Injector) {
        super(injector, 'package-unused-labels');
    }

    search: (query: string, page: number) => Observable<SearchResult<IPackageUnusedLabel>>;

    newInstance() {
        return new PackageUnusedLabel({
            id: uuid.v4(),
            version: 0,
            Label: ''
        });
    }

    dbInstance(fromDb: IPackageUnusedLabel) {
        return new PackageUnusedLabel(fromDb);
    }

    instanceForSocket(object: IPackageUnusedLabel) {
        return {
            id: object.id,
            version: object.version,

            Label: object.Label
        };
    }

    refresh(packageUnusedLabel: IPackageUnusedLabel) {
        super.refresh(packageUnusedLabel);
    }

    getUnusedLabels(): Observable<ObjectObservable<IPackageUnusedLabel>[]> {
        const results = new Subject<ObjectObservable<IPackageUnusedLabel>[]>();
        this.socket.emitPromise('getUnusedLabels')
            .then(packageUnusedLabelIds => {
                results.next(packageUnusedLabelIds.map(id => this.getAssociated(id)));
            })
            .catch(err => {

                console.log('err: ');
                console.log(err);

            });

        return results.asObservable();
    }

    save(packageUnusedLabel: IPackageUnusedLabel, callback?, skipNotification?) {
        super.save(packageUnusedLabel, callback, skipNotification);
    }

    uploadNewPackageIds(ids: Array<string>) {
        return this.socket.emitPromise('import', ids)
            .then(numberOfImportedTags => {
                return numberOfImportedTags;
            });
    }
}
