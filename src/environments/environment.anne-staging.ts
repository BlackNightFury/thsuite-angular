export const environment = {
    production: true,

    apiUrl: 'https://stagingapi.thsuite.com',

    //BOTH
    state: 'CO',
    authIdField: { name: 'email', label: 'Email' },

    drawerCloseMode: 'report',
    drawerOpenMode: 'totalOnly',

    enableDefaultUser: false,

    defaultTimeFrame: 'thisWeek', // today | yesterday | thisWeek | thisMonth | lastMonth | thisQuarter

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
    shouldShowAgeVerification: true,
    shouldShowBirthdateEntry: false,
    shouldShowLoyaltyRewardLink: false,
    shouldShowStateSelector: true,
    shouldShowReprintLabels: false,
    shouldShowCartAddButton: false,
    shouldShowCartMinusButton: true,
    shouldShowLabResults: false,
    bulkFlowerMode: false, //Allows the creation of bulk flower variations
    canEditReceivedQuantity: false,

    //MED SPECIFIC
    shouldShowPatientPermissions: false,
    shouldShowMedicalReports: false,
    shouldShowPatientQueue: false, //When set will show both POS queue and admin panel queue
    shouldShowPhysicians: false,
    shouldShowCaregivers: false,
    shouldShowVisitors: false,
    shouldShowPatientIDExpiration: false,
    printPatientLabels: false,
    medicalIdRegex: '.', //Regex used to group patient IDs
    medicalIdSeparator: '',
    //REC SPECIFIC

    caregiverMinimumAge : 21
};
