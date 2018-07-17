import {NgModule} from "@angular/core";
import {RouterModule, RouterOutlet, Routes} from "@angular/router";
import {InventoryComponent} from "./inventory.component";
import {ProductsIndexComponent} from "./products-index/products-index.component";
import {ProductTypesIndexComponent} from "./product-types-index/product-types-index.component";
import {SuppliersIndexComponent} from "./suppliers-index/suppliers-index.component";
import {IncomingIndexComponent} from "./incoming-index/incoming-index.component";
import {OutgoingIndexComponent} from "./outgoing-index/outgoing-index.component";
import {ItemsIndexComponent} from "./items-index/items-index.component";
import {AddEditViewProductTypeComponent} from "./product-types-index/add-edit-view-product-type/add-edit-view-product-type.component";
import {AddEditViewSupplierComponent} from "./suppliers-index/add-edit-view-supplier/add-edit-view-supplier.component";
import {AddEditViewProductComponent} from "app/admin/inventory/products-index/add-edit-view-product/add-edit-view-product.component";
import {VariationsIndexComponent} from "./products-index/add-edit-view-product/variations-index/variations-index.component";
import {AddEditViewVariationComponent} from "./products-index/add-edit-view-product/variations-index/add-edit-view-variation/add-edit-view-variation.component";
import {PackagesIndexComponent} from "./items-index/add-edit-view-item/packages-index/packages-index.component";
import {AddEditViewPackageComponent} from "./items-index/add-edit-view-item/packages-index/add-edit-view-package/add-edit-view-package.component";
import {AddEditViewItemComponent} from "./items-index/add-edit-view-item/add-edit-view-item.component";
import {AddEditViewIncomingComponent} from "./incoming-index/add-edit-view-incoming/add-edit-view-incoming.component";
import {IncomingPackagesIndexComponent} from "./incoming-index/add-edit-view-incoming/incoming-packages-index/incoming-packages-index.component";
import {ViewPackageComponent} from "./incoming-index/add-edit-view-incoming/incoming-packages-index/view-package/view-package.component";
import {AddEditViewOutgoingComponent} from "app/admin/inventory/outgoing-index/add-edit-view-outgoing/add-edit-view-outgoing.component";
import {OutgoingPackagesIndexComponent} from "./outgoing-index/add-edit-view-outgoing/outgoing-packages-index/outgoing-packages-index.component";
import {BarcodesIndexComponent} from "./barcodes-index/barcodes-index.component";
import {AddEditViewBarcodeComponent} from "./add-edit-view-barcode/add-edit-view-barcode.component";
import {AddEditViewAllocationComponent} from "./add-edit-view-barcode/add-edit-view-allocation/add-edit-view-allocation.component";
import {PricingTiersIndexComponent} from "./pricing-tiers-index/pricing-tiers-index.component";
import {AddEditViewPricingTierComponent} from "./pricing-tiers-index/add-edit-view-pricing-tier/add-edit-view-pricing-tier.component";
import {ScaleAllocationComponent} from "./add-edit-view-barcode/add-edit-view-allocation/scale-allocation/scale-allocation.component";
import {AlertsComponent} from "./alerts/alerts.component";
import {PackagesComponent} from "./packages/packages.component";
import {PackageDetailsComponent} from "./packages/package-details/package-details.component";
import {PackageConversionComponent} from "./packages/package-conversion/package-conversion.component";
import {RouterOutletComponent} from "../../util/components/router-outlet/router-outlet.component";

const routes: Routes = [
    {
        path: '',
        component: InventoryComponent,
        data: {sectionTitle: 'Inventory Management'},
        children: [
            {
                path: '',
                redirectTo: 'packages/dashboard',
                pathMatch: 'full'
            },
            {
                path: 'products',
                component: ProductsIndexComponent,
                data: {
                    mode: 'products'
                },
                children: [
                    {
                        component: AddEditViewProductComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        },
                        children: [
                            {
                                component: VariationsIndexComponent,
                                path: 'variations',
                                children: [
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'edit/:id',
                                        data: {
                                            mode: 'edit'
                                        },
                                    },
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'add',
                                        data: {
                                            mode: 'add'
                                        },
                                    },
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'view/:id',
                                        data: {
                                            mode: 'view'
                                        },
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        component: AddEditViewProductComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        },
                        children: [
                            {
                                component: VariationsIndexComponent,
                                path: 'variations',
                                children: [
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'edit/:id',
                                        data: {
                                            mode: 'edit'
                                        },
                                    },
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'add',
                                        data: {
                                            mode: 'add'
                                        },
                                    },
                                    {
                                        component: AddEditViewVariationComponent,
                                        path: 'view/:id',
                                        data: {
                                            mode: 'view'
                                        },
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        component: AddEditViewProductComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'items',
                component: ItemsIndexComponent,
                data: {
                    mode: 'items'
                },
                children: [
                    {
                        component: AddEditViewItemComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        },
                        children: [
                            {
                                component: PackagesIndexComponent,
                                path: 'packages',
                                children: [
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'add'
                                        },
                                        path: 'add'
                                    },
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'edit'
                                        },
                                        path: 'edit/:id'
                                    },
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'view'
                                        },
                                        path: 'view/:id'
                                    }
                                ]
                            },

                        ]
                    },
                    {
                        component: AddEditViewItemComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        },
                        children: [
                            {
                                component: PackagesIndexComponent,
                                path: 'packages',
                                children: [
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'add'
                                        },
                                        path: 'add'
                                    },
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'edit'
                                        },
                                        path: 'edit/:id'
                                    },
                                    {
                                        component: AddEditViewPackageComponent,
                                        data: {
                                            mode: 'view'
                                        },
                                        path: 'view/:id'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        component: AddEditViewItemComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'product-types',
                component: ProductTypesIndexComponent,
                data: {
                    mode: 'product-types'
                },
                children: [
                    {
                        component: AddEditViewProductTypeComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewProductTypeComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewProductTypeComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'suppliers',
                component: SuppliersIndexComponent,
                data: {
                    mode: 'suppliers'
                },
                children: [
                    {
                        component: AddEditViewSupplierComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        }
                    },
                    {
                        component: AddEditViewSupplierComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        }
                    },
                    {
                        component: AddEditViewSupplierComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    }
                ]
            },
            {
                path: 'incoming',
                component: IncomingIndexComponent,
                data: {
                    mode: 'incoming'
                },
                children: [
                    {
                        component: AddEditViewIncomingComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        },
                        children: [
                            {
                                component: IncomingPackagesIndexComponent,
                                path: 'packages',
                                children: [
                                    {
                                        component: ViewPackageComponent,
                                        path: 'view/:id'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                path: 'outgoing',
                component: OutgoingIndexComponent,
                data: {
                    mode: 'outgoing'
                },
                children: [
                    {
                        component: AddEditViewOutgoingComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        },
                        children: [
                            {
                                component: OutgoingPackagesIndexComponent,
                                path: 'packages'
                            }
                        ]
                    }
                ]
            },
            {
                path: 'barcodes',
                component: BarcodesIndexComponent,
                data: {
                    mode: 'barcodes'
                },
                children: [
                    {
                        component: AddEditViewBarcodeComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view',
                            parentDashboard: 'barcodes'
                        },
                        children: [
                            {
                                component: AddEditViewAllocationComponent,
                                path: 'allocate/add',
                                data: {
                                    mode: 'add',
                                    parentDashboard: 'barcodes'
                                }
                            },
                            {
                                component: AddEditViewAllocationComponent,
                                path: 'allocate/view',
                                data: {
                                    mode: 'view',
                                    parentDashboard: 'barcodes'
                                }
                            },
                            {
                                component: ScaleAllocationComponent,
                                path: 'allocate/scale',
                                data: {
                                    mode: 'add',
                                    parentDashboard: 'barcodes'
                                }
                            }
                        ]
                    },
                    {
                        component: AddEditViewBarcodeComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit',
                            parentDashboard: 'barcodes'
                        }
                    },
                    {
                        component: AddEditViewBarcodeComponent,
                        path: 'add',
                        data: {
                            mode: 'add',
                            parentDashboard: 'barcodes'
                        }
                    }
                ]
            },
            {
                path: 'pricing-tiers',
                component: PricingTiersIndexComponent,
                data: {
                    mode: 'pricing-tiers'
                },
                children: [
                    {
                        component: AddEditViewPricingTierComponent,
                        path: 'view/:id',
                        data: {
                            mode: 'view'
                        },
                    },
                    {
                        component: AddEditViewPricingTierComponent,
                        path: 'add',
                        data: {
                            mode: 'add'
                        }
                    },
                    {
                        component: AddEditViewPricingTierComponent,
                        path: 'edit/:id',
                        data: {
                            mode: 'edit'
                        },
                    }
                ]
            },
            {
                path: 'alerts',
                component: AlertsComponent,
                data: {
                    mode: 'alerts'
                },
            },
            {
                path: 'packages',
                component: RouterOutletComponent,
                data: {
                    mode: 'packages'
                },
                children: [
                    {
                        component: PackagesComponent,
                        path: 'dashboard',
                        data: {
                            mode: 'packages'
                        }
                    },
                    {
                        component: PackageConversionComponent,
                        path: 'create-convert/:id',
                        data: {
                            mode: 'create-convert'
                        }
                    },
                    {
                        component: PackageDetailsComponent,
                        path: 'details/:id/:mode',
                        children : [
                                {
                                component: AddEditViewBarcodeComponent,
                                path: 'barcodes/view/:id',
                                data: {
                                    mode: 'view',
                                    parentDashboard: 'packages'
                                },
                                children: [
                                    {
                                        component: AddEditViewAllocationComponent,
                                        path: 'allocate/add',
                                        data: {
                                            mode: 'add',
                                            parentDashboard: 'packages'
                                        }
                                    },
                                    {
                                        component: AddEditViewAllocationComponent,
                                        path: 'allocate/view',
                                        data: {
                                            mode: 'view',
                                            parentDashboard: 'packages'
                                        }
                                    },
                                    {
                                        component: ScaleAllocationComponent,
                                        path: 'allocate/scale',
                                        data: {
                                            mode: 'add',
                                            parentDashboard: 'packages'
                                        }
                                    }
                                ]
                            },
                            {
                                component: AddEditViewBarcodeComponent,
                                path: 'barcodes/edit/:id',
                                data: {
                                    mode: 'edit',
                                    parentDashboard: 'packages'
                                }
                            },
                            {
                                component: AddEditViewBarcodeComponent,
                                path: 'barcodes/add',
                                data: {
                                    mode: 'add',
                                    parentDashboard: 'packages'
                                }
                            }
                        ]
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
export class InventoryRoutingModule {
}
