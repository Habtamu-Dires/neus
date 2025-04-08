import { Routes } from '@angular/router';
import { authGuard } from './services/guard/auth.guard';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    {path: '',
        redirectTo: 'user',
        pathMatch: 'full'
    },
    {path:'user',
        loadChildren:() => import('./modules/user/user.module').then(m => m.UserModule),
    },
    {path:'admin',
        loadChildren:() => import('./modules/admin/admin.module').then(m => m.AdminModule),
        canLoad:[authGuard],
        canActivate:[authGuard],
        canActivateChild:[authGuard]
    },
    {path:'register',component:RegisterComponent}
];
