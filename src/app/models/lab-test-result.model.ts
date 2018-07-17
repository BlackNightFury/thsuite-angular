import {ILabTestResult} from "./interfaces/lab-test-result.interface";
import {IPackage} from "./interfaces/package.interface";
export class LabTestResult implements ILabTestResult{
    id: string;
    version: number;

    packageId: string;
    Package?: IPackage;

    thc: number;
    thcA: number;
    cbd: number;
    cbdA: number;
    cbg: number;
    cbn: number;
    cbgA: number;

    potencyUnits: '%'|'mg/ml';

    aPinene: number;
    bPinene: number;
    bMyrcene: number;
    limonene: number;
    terpinolene: number;
    ocimene: number;
    linalool: number;
    bCaryophyllene: number;
    humulene: number;
    bEudesmol: number;
    caryophylleneOxide: number;
    nerolidol: number;

    constructor(obj: ILabTestResult) {
        Object.assign(this, obj);
    }
}
