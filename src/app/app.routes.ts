import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Transactions } from './components/transactions/transactions';
import { Reports } from './components/reports/reports';
import { Properties } from './components/properties/properties';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'properties', component: Properties, canActivate: [authGuard] },
  { path: 'transactions', component: Transactions, canActivate: [authGuard] },
  { path: 'reports', component: Reports, canActivate: [authGuard] }
];
