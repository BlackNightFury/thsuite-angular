import {IPackageUnusedLabel} from "./interfaces/package-unused-label.interface";

export class PackageUnusedLabel implements IPackageUnusedLabel {
    id: string;
    version: number;

    Label: string;

    constructor(obj: IPackageUnusedLabel) {
        Object.assign(this, obj);
    }
}
