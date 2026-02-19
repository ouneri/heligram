import {Routes} from '@angular/router';
import {LoginPage} from './page/login-page/login-page';
import {Feed} from './components/feed/feed';
import {MainLayout} from './page/main-layout/main-layout';
import {authGuard} from './guards/auth-guard';
import {RegisterPage} from './page/register-page/register-page';
import {Profilelist} from './components/profilelist/profilelist';
import {Search} from './components/search/search';
import {PostDetailPage} from './page/post-detail-page/post-detail-page';
import {RelationshipPage} from './page/relationship-page/relationship-page';
import {ComingSoonPage} from './page/coming-soon-page/coming-soon-page';

export const routes: Routes = [
  {path: 'register', component: RegisterPage},
  {path: '', redirectTo: '/main/feed', pathMatch: 'full'},
  {path: 'login', component: LoginPage},

  {
    path: 'main',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {path: 'feed', component: Feed},
      {path: '', redirectTo: 'feed', pathMatch: 'full'},
      {path: 'profile/:id', component: Profilelist},
      {path: 'search', component: Search},
      {path: 'post/:id', component: PostDetailPage},
      {path: 'relationship', component: RelationshipPage},
      {path: 'subscribes', component: RelationshipPage},
      {path: 'messages', component: ComingSoonPage},
      {path: 'community', component: ComingSoonPage},
      {path: 'payments', component: ComingSoonPage},
      {path: 'heliprem', component: ComingSoonPage},
    ]
  },
];
