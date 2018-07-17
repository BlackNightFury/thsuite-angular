import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {StoreComponent} from "./store.component";
import {LocationsIndexComponent} from "./locations-index/locations-index.component";
import {DiscountsIndexComponent} from "./discounts-index/discounts-index.component";
import {LoyaltyRewardsIndexComponent} from "./loyalty-rewards-index/loyalty-rewards-index.component";
import {AddEditViewLocationComponent} from "./locations-index/add-edit-view-locations/add-edit-view-location.component";
import {AddEditViewDiscountComponent} from "./discounts-index/add-edit-view-discount/add-edit-view-discount.component";
import {TaxesIndexComponent} from "./taxes-index/taxes-index.component";
import {AddEditViewTaxComponent} from "./taxes-index/add-edit-view-tax/add-edit-view-tax.component";
import {AddEditViewLoyaltyRewardComponent} from "./loyalty-rewards-index/add-edit-view-loyalty-reward/add-edit-view-loyalty-reward.component";
import {SettingsIndexComponent} from "./settings-index/settings-index.component";
import {TimeClocksIndexComponent} from "./time-clocks-index/time-clocks-index.component";
import {AddEditViewTimeClockComponent} from "./time-clocks-index/add-edit-view-time-clock/add-edit-view-time-clock.component";
import {DrawersIndexComponent} from "./drawers-index/drawers-index.component";
import {TagsIndexComponent} from "./tags-index/tags-index.component";
import {AddEditViewTagComponent} from "./tags-index/add-edit-view-tag/add-edit-view-tag.component";

const routes: Routes = [
    {
        path: '',
        component: StoreComponent,
        data: {sectionTitle: 'Store Management'},
        children: [
            {
                path: '',
                redirectTo: 'locations',
                pathMatch: 'full'
            },
            {
                path: 'locations',
                component: LocationsIndexComponent,
                data: {
                    mode: 'locations'
                },
                children: [
                    {
                        component: AddEditViewLocationComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewLocationComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewLocationComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'discounts',
                component: DiscountsIndexComponent,
                data: {
                    mode: 'discounts'
                },
                children: [
                    {
                        component: AddEditViewDiscountComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewDiscountComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewDiscountComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'rewards',
                component: LoyaltyRewardsIndexComponent,
                data: {
                    mode: 'rewards'
                },
                children: [
                    {
                        component: AddEditViewLoyaltyRewardComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewLoyaltyRewardComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewLoyaltyRewardComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'taxes',
                component: TaxesIndexComponent,
                data: {
                    mode: 'taxes'
                },
                children: [
                    {
                        component: AddEditViewTaxComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewTaxComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewTaxComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'settings',
                component: SettingsIndexComponent,
                data: {
                    mode: 'settings'
                },
                children: [
                ]
            },
            {
                path: 'time-clocks',
                component: TimeClocksIndexComponent,
                data: {
                    mode: 'time-clocks'
                },
                children: [
                    {
                        path: 'add',
                        component: AddEditViewTimeClockComponent,
                        data: {
                            mode: 'add'
                        }
                    },
                    {
                        path: 'edit/:id',
                        component: AddEditViewTimeClockComponent,
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        path: 'view/:id',
                        component: AddEditViewTimeClockComponent,
                        data: {
                            mode: 'view'
                        }
                    }
                ]
            },
            {
                path: 'drawers',
                component: DrawersIndexComponent,
                data: {
                    mode: 'drawers'
                },
                children: [
                ]
            },
            {
                path: 'tags',
                component: TagsIndexComponent,
                data: {
                    mode: 'tags'
                },
                children: [
                    {
                        path: 'add',
                        component: AddEditViewTagComponent,
                        data: {
                            mode: 'add'
                        }
                    },
                    {
                        path: 'edit/:id',
                        component: AddEditViewTagComponent,
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        path: 'view/:id',
                        component: AddEditViewTagComponent,
                        data: {
                            mode: 'view'
                        }
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class StoreRoutingModule {
}
