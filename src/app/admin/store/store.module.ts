import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";

import {StoreRoutingModule} from "./store-routing.module";
import {StoreComponent} from "./store.component";
import {LocationsIndexComponent} from "./locations-index/locations-index.component";
import {AddEditViewLocationComponent} from "./locations-index/add-edit-view-locations/add-edit-view-location.component";
import {DiscountsIndexComponent} from "./discounts-index/discounts-index.component";
import {LoyaltyRewardsIndexComponent} from "./loyalty-rewards-index/loyalty-rewards-index.component";
import {MdButtonModule} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {UtilModule} from "../../util/util.module";
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
import { OwlDateTimeModule, OwlNativeDateTimeModule} from 'ng4-pick-datetime';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        StoreRoutingModule,

        MdButtonModule,

        UtilModule,

        OwlDateTimeModule,
        OwlNativeDateTimeModule
    ],
    declarations: [
        StoreComponent,

        LocationsIndexComponent,
        AddEditViewLocationComponent,

        DiscountsIndexComponent,
        AddEditViewDiscountComponent,

        LoyaltyRewardsIndexComponent,
        AddEditViewLoyaltyRewardComponent,

        TaxesIndexComponent,
        AddEditViewTaxComponent,

        SettingsIndexComponent,
        DrawersIndexComponent,

        TimeClocksIndexComponent,
        AddEditViewTimeClockComponent,

        TagsIndexComponent,
        AddEditViewTagComponent
    ]
})
export class StoreModule {
}
