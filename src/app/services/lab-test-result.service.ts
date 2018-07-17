import {ILabTestResult} from "../models/interfaces/lab-test-result.interface";
import {CommonService} from "./common.service";
import {Injectable, Injector} from "@angular/core";
import * as uuid from 'uuid';
import {LabTestResult} from "../models/lab-test-result.model";
import {ObjectObservable} from "../lib/object-observable";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
@Injectable()
export class LabTestResultService extends CommonService<ILabTestResult>{

    constructor(
        injector: Injector
    ){
        super(injector, 'lab-test-results');
    }

    newInstance(){
        return new LabTestResult({
            id: uuid.v4(),
            version: 0,
            packageId: undefined,
            thc: 0,
            thcA: 0,
            cbd: 0,
            cbdA: 0,
            cbg: 0,
            cbn: 0,
            cbgA: 0,

            potencyUnits: '%',

            aPinene: 0,
            bPinene: 0,
            bMyrcene: 0,
            limonene: 0,
            terpinolene: 0,
            ocimene: 0,
            linalool: 0,
            bCaryophyllene: 0,
            humulene: 0,
            bEudesmol: 0,
            caryophylleneOxide: 0,
            nerolidol: 0,
        });
    }

    dbInstance(fromDb: ILabTestResult){
        return new LabTestResult(fromDb);
    }

    instanceForSocket(object: ILabTestResult){
        return {
            id: object.id,
            version: object.version,

            packageId: object.packageId,
            thc: object.thc,
            thcA: object.thcA,
            cbd: object.cbd,
            cbdA: object.cbdA,
            cbg: object.cbg,
            cbn: object.cbn,
            cbgA: object.cbgA,

            potencyUnits: object.potencyUnits,

            aPinene: object.aPinene,
            bPinene: object.bPinene,
            bMyrcene: object.bMyrcene,
            limonene: object.limonene,
            terpinolene: object.terpinolene,
            ocimene: object.ocimene,
            linalool: object.linalool,
            bCaryophyllene: object.bCaryophyllene,
            humulene: object.humulene,
            bEudesmol: object.bEudesmol,
            caryophylleneOxide: object.caryophylleneOxide,
            nerolidol: object.nerolidol,

        }
    }

    getByPackageId(packageId: string): Observable<ILabTestResult>{

        const result = new Subject<ILabTestResult>();

        this.socket.emitPromise('getByPackageId', packageId)
            .then(labResultId => {
                if(labResultId) {
                    this.get(labResultId).subscribe(result);
                }else{
                    result.next(null);
                }
            });

        return result.asObservable();

    }

}
