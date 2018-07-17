export const environment = {

    production: true,

    apiUrl: 'https://herban-legends-api.thsuite.com',

    //BOTH
    state: 'MD',
    authIdField: { name: 'email', label: 'Email' },

    drawerCloseMode: 'totalOnly',
    drawerOpenMode: 'totalOnly',

    enableDefaultUser: false,

    defaultTimeFrame: 'today', // today | yesterday | thisWeek | thisMonth | lastMonth | thisQuarter

    canCheckoutUnderWholesale: true,

    wholeDollarPricing: false,

    //POS Pin and Pin Entry (Checkout, Time Clocks)
    pointOfSalePin: false, //shows POS Pin field on employee creation
    shouldShowPinEntryUponCheckout: false,
    shouldShowPinEntryUponClock: false,

    managerApprovalForCustomDiscounts: false,
    requirePatientReferrer: false,
    requirePatientAddress: false,

    shouldAutoAllocateInventory: true,
    shouldShowAgeVerification: false,
    shouldShowBirthdateEntry: false,
    shouldShowLoyaltyRewardLink: false,
    shouldShowStateSelector: false,
    shouldShowReprintLabels: true,
    shouldShowCartAddButton: false,
    shouldShowCartMinusButton: true,
    shouldShowLabResults: false,
    deviceDrawerClosingReport: true,
    bulkFlowerMode: true, //Allows the creation of bulk flower variations
    canEditReceivedQuantity: true,

    //MED SPECIFIC
    shouldShowPatientPermissions: true,
    shouldShowMedicalReports: true,
    shouldShowPatientQueue: true, //When set will show both POS queue and admin panel queue
    shouldShowPhysicians: true,
    shouldShowCaregivers: true,
    shouldShowPatientIDExpiration: false,
    printPatientLabels: true,
    medicalIdRegex: '.{1,4}', //Regex used to group patient IDs
    medicalIdSeparator: '-',
    //REC SPECIFIC

    caregiverMinimumAge : 21
};
