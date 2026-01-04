import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Contests } from './contests/contests';
import { Calender } from './calender/calender';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Dashboard },
    { path: 'contests', component: Contests },
    { path: 'calender', component: Calender }
];
