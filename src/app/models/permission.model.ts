import {IPermission} from "./interfaces/permission.interface";

export class Permission implements IPermission {
    id: string;
    version: number;

    clientId: string;

    userId: string;

    patientManagement: 'none'|'view'|'edit';
    canEditPatientGroups: boolean;
    canEditPatients: boolean;
    canAccessMedicalApp: boolean;
    canAccessPhysiciansDashboard: boolean;
    canAccessCaregiverDashboard: boolean;
    canAccessVisitorDashboard: boolean;
    canDoPatientCheck: boolean;
    canReleaseBudtender: boolean;


    inventoryManagement: 'none'|'view'|'edit';
    canEditProducts: boolean;
    canEditItems: boolean;
    canEditProductTypes: boolean;
    canEditSuppliers: boolean;
    canEditBarcodes: boolean;
    canEditPricingTiers: boolean;
    canEditLineItems: boolean;


    storeManagement: 'none'|'view'|'edit';
    canEditStores: boolean;
    canEditDiscounts: boolean;
    canEditLoyaltyRewards: boolean;
    canEditTaxes: boolean;


    reportsManagement: 'none'|'view'|'edit';

    employeeManagement: 'none'|'view'|'edit';

    administrativeManagement: 'none'|'edit';

    canScanItems: boolean;
    canManuallyAddCannabisItems: boolean;
    canManuallyAddNonCannabisItems: boolean;
    canVoidItems: boolean;
    canAcceptReturns: boolean;

    canManuallyDiscount: boolean;

    canManuallyVerifyAge: boolean;
    canAddNotesToPatient: boolean;

    canRegisterDevice: boolean;
    canSubmitToMetrc: boolean;
    canPersistentLogin: boolean;

    canEditStoreSettings: boolean;

    constructor(obj: IPermission) {
        Object.assign(this, obj);
    }
}
