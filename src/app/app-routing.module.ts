import {NgModule} from "@angular/core";
import {PreloadAllModules, RouterModule, Routes} from "@angular/router";

import {AdminAuthGuard} from "./util/guards/admin-auth-guard.service";
import {PosAuthGuard} from "./util/guards/pos-auth-guard.service";

const routes: Routes = [
    {
        path: 'admin',
        loadChildren: './admin/admin.module.ts#AdminModule',
        // canLoad: [AdminAuthGuard],
        canActivate: [AdminAuthGuard]
    },
    {
        path: 'pos',
        loadChildren: './pos/pos.module.ts#PosModule',
        // canLoad: [PosAuthGuard],
        canActivate: [PosAuthGuard]
    },
    {
        path: 'auth',
        loadChildren: './auth/auth.module.ts#AuthModule'
    },
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {enableTracing: true, preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
