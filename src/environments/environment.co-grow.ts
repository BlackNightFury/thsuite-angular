export const environment = {

    production: true,

    apiUrl: 'https://co-grow-api.thsuite.com',

    //BOTH
    state: 'CO',
    authIdField: { name: 'badgeId', label: 'Badge Id' },

    drawerCloseMode: 'denominations',
    drawerOpenMode: 'denominations',

    enableDefaultUser: false,

    defaultTimeFrame: 'thisWeek', // today | yesterday | thisWeek | thisMonth | lastMonth | thisQuarter

    canCheckoutUnderWholesale: true,

    wholeDollarPricing: true,

    //POS Pin and Pin Entry (Checkout, Time Clocks)
    pointOfSalePin: false, //shows POS Pin field on employee creation
    shouldShowPinEntryUponCheckout: false,
    shouldShowPinEntryUponClock: false,

    managerApprovalForCustomDiscounts: true,
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
    deviceDrawerClosingReport: false,
    bulkFlowerMode: false, //Allows the creation of bulk flower variations
    canEditReceivedQuantity: false,

    //MED SPECIFIC
    shouldShowPatientPermissions: false,
    shouldShowMedicalReports: false,
    shouldShowPatientQueue: false,
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
