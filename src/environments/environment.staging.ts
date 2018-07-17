export const environment = {
    production: false,
    staging: true,

    apiUrl: 'https://stagingapi.thsuite.com',

    //BOTH
    state: 'CO',
    authIdField: { name: 'email', label: 'Email' },

    drawerCloseMode: 'totalOnly',
    drawerOpenMode: 'totalOnly',

    enableDefaultUser: false,

    defaultTimeFrame: 'thisWeek', // today | yesterday | thisWeek | thisMonth | lastMonth | thisQuarter

    canCheckoutUnderWholesale: false,

    wholeDollarPricing: false,

    //POS Pin and Pin Entry (Checkout, Time Clocks)
    pointOfSalePin: false, //shows POS Pin field on employee creation
    shouldShowPinEntryUponCheckout: false,
    shouldShowPinEntryUponClock: false,

    managerApprovalForCustomDiscounts: false,
    requirePatientReferrer: true,
    requirePatientAddress: true,

    shouldAutoAllocateInventory: true,
    shouldShowAgeVerification: true,
    shouldShowBirthdateEntry: false,
    shouldShowLoyaltyRewardLink: false,
    shouldShowStateSelector: true,
    shouldShowReprintLabels: false,
    shouldShowCartAddButton: false,
    shouldShowCartMinusButton: true,
    shouldShowLabResults: false,
    bulkFlowerMode: false, //Allows the creation of bulk flower variations
    deviceDrawerClosingReport: true,
    canEditReceivedQuantity: false,

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
