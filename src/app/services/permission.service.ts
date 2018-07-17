import {Injectable, Injector} from "@angular/core";
import {Product} from "../models/product.model";
import {Observable, Subject} from "rxjs";
import {CommonService} from "./common.service";
import {IProduct} from "../models/interfaces/product.interface";
import * as uuid from "uuid";
import {SocketService} from "../lib/socket";
import {ProductTypeService} from "./product-type.service";
import {ObjectObservable} from "../lib/object-observable";
import {SearchResult} from "../lib/search-result";
import {Router} from "@angular/router";
import {ProductVariationService} from "./product-variation.service";
import {SearchableService} from "app/services/searchable.service";
import {SortBy} from "../util/directives/sort-table-header.directive";
import {Mixin} from "../lib/decorators/class/mixin";
import {IPermission} from "../models/interfaces/permission.interface";
import {Permission} from "../models/permission.model";


@Injectable()
export class PermissionService extends CommonService<IPermission> {

    constructor(injector: Injector) {
        super(injector, 'permissions');
    }

    search: (query: string, page: number, sortBy: SortBy, cannabisCategory?: string) => Observable<SearchResult<IProduct>>;

    getByUserId(userId: string): Observable<IPermission> {

        let permissionSubject = new Subject<IPermission>();

        this.socket.emitPromise('getByUserId', userId)
            .then(permissionId => {
                this.get(permissionId)
                    .subscribe(permissionSubject);
            });

        return permissionSubject.asObservable();
    }

    newInstance(): IPermission {
        throw new Error("Permission object cannot be created on frontend");
    }
    dbInstance(fromDb: IPermission) {
        return new Permission(fromDb);
    }

    instanceForSocket(object: IPermission) {
        return {
            id: object.id,
            version: object.version,


            clientId: object.clientId,

            userId: object.userId,

            patientManagement: object.patientManagement,
            canEditPatientGroups: object.canEditPatientGroups,
            canEditPatients: object.canEditPatients,
            canAccessMedicalApp: object.canAccessMedicalApp,
            canAccessPhysiciansDashboard: object.canAccessPhysiciansDashboard,
            canAccessCaregiverDashboard: object.canAccessCaregiverDashboard,
            canAccessVisitorDashboard: object.canAccessVisitorDashboard,
            canDoPatientCheck: object.canDoPatientCheck,
            canReleaseBudtender: object.canReleaseBudtender,


            inventoryManagement: object.inventoryManagement,
            canEditProducts: object.canEditProducts,
            canEditItems: object.canEditItems,
            canEditProductTypes: object.canEditProductTypes,
            canEditSuppliers: object.canEditSuppliers,
            canEditBarcodes: object.canEditBarcodes,
            canEditPricingTiers: object.canEditPricingTiers,
            canEditLineItems: object.canEditLineItems,


            storeManagement: object.storeManagement,
            canEditStores: object.canEditStores,
            canEditDiscounts: object.canEditDiscounts,
            canEditLoyaltyRewards: object.canEditLoyaltyRewards,
            canEditTaxes: object.canEditTaxes,


            reportsManagement: object.reportsManagement,

            employeeManagement: object.employeeManagement,

            administrativeManagement: object.administrativeManagement,

            canScanItems: object.canScanItems,
            canManuallyAddCannabisItems: object.canManuallyAddCannabisItems,
            canManuallyAddNonCannabisItems: object.canManuallyAddNonCannabisItems,
            canVoidItems: object.canVoidItems,
            canAcceptReturns: object.canAcceptReturns,

            canManuallyDiscount: object.canManuallyDiscount,

            canManuallyVerifyAge: object.canManuallyVerifyAge,
            canAddNotesToPatient: object.canAddNotesToPatient,

            canRegisterDevice: object.canRegisterDevice,
            canSubmitToMetrc: object.canSubmitToMetrc,
            canPersistentLogin: object.canPersistentLogin,

            canEditStoreSettings: object.canEditStoreSettings
        }
    }

    edit(object: IPermission) {
        this.router.navigate(['admin', 'employees', 'edit', object.userId, 'permissions'])
    }

}
