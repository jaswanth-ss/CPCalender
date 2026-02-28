import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Contests } from './contests/contests';
import { calendar } from './calendar/calendar';
import { authGuard } from './guards/auth.guard';
import { Auth } from './auth/auth';

export const routes: Routes = [
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: 'auth', component: Auth},
    { path: 'home', component: Dashboard, canActivate: [authGuard] },
    { path: 'contests', component: Contests, canActivate: [authGuard] },
    { path: 'calendar', component: calendar, canActivate: [authGuard] }
];
