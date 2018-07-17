import {ICommon} from "./common.interface";
import {IPackage} from "./package.interface";
export interface ILabTestResult extends ICommon{

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
}
