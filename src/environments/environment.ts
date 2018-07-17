// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
    production: false,

    apiUrl: 'http://localhost:3000',

    //BOTH
    state: 'MD',
    authIdField: { name: 'email', label: 'Email' },

    drawerCloseMode: 'totalOnly',
    drawerOpenMode: 'totalOnly',

    enableDefaultUser: false,

    defaultTimeFrame: 'thisWeek', // today | yesterday | thisWeek | thisMonth | lastMonth | thisQuarter

    canCheckoutUnderWholesale: true,

    wholeDollarPricing: false,

    //POS Pin and Pin Entry (Checkout, Time Clocks)
    pointOfSalePin: false, //shows POS Pin field on employee creation
    shouldShowPinEntryUponCheckout: false,
    shouldShowPinEntryUponClock: false,

    managerApprovalForCustomDiscounts: true,
    requirePatientReferrer: false,
    requirePatientAddress: false,

    shouldAutoAllocateInventory: true,
    shouldShowAgeVerification: true,
    shouldShowBirthdateEntry: false,
    shouldShowLoyaltyRewardLink: true,
    shouldShowStateSelector: true,
    shouldShowReprintLabels: true,
    shouldShowCartAddButton: false,
    shouldShowCartMinusButton: true,
    shouldShowLabResults: true,
    bulkFlowerMode: false, //Allows the creation of bulk flower variations
    deviceDrawerClosingReport: true,
    canEditReceivedQuantity: true,

    //MED SPECIFIC
    shouldShowPatientPermissions: true,
    shouldShowMedicalReports: true,
    shouldShowPatientQueue: true, //When set will show both POS queue and admin panel queue
    shouldShowPhysicians: true,
    shouldShowCaregivers: true,
    shouldShowVisitors: true,
    shouldShowPatientIDExpiration: false,
    printPatientLabels: true,
    medicalIdRegex: '.{1,4}', //Regex used to group patient IDs
    medicalIdSeparator: '-',
    //REC SPECIFIC

    caregiverMinimumAge : 21
};
