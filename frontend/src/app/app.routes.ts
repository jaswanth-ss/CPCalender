import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Contests } from './contests/contests';
import { calendar } from './calendar/calendar';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Dashboard },
    { path: 'contests', component: Contests },
    { path: 'calendar', component: calendar }
];
