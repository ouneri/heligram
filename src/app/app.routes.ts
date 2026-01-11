import { Routes } from '@angular/router';
import {LoginPage} from './page/login-page/login-page';
import {Feed} from './components/feed/feed';
import {MainLayout} from './page/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';
import { RegisterPage } from './page/register-page/register-page';
import { Profilelist } from './components/profilelist/profilelist';
import { Search } from './components/search/search';


export const routes: Routes = [
 {path: '', redirectTo:'/main/feed', pathMatch: 'full'},
 {path: 'login', component: LoginPage},
 {path: 'register', component: RegisterPage},
 {
  path: 'main',
  component: MainLayout,
  canActivate: [authGuard],
  children: [
    {path: 'feed', component: Feed},
    {path: '', redirectTo: 'feed', pathMatch: 'full'},
    {path: 'profile/:id', component: Profilelist},
    {path: 'search', component: Search},
  ]
 },
];
