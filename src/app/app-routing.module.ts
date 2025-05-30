// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './core/pages/welcome/welcome.component';
import { MenuComponent } from './core/pages/menu/menu.component';
import { NewsListComponent } from './news/components/news-list/news-list.component';
import { UserOnboardingComponent } from './users/user-onboarding/user-onboarding.component';
import { AuthGuard } from './core/auth.guard';
import { NonAuthGuard } from './core/non-auth.guard';
import { SurveyComponent } from './core/components/survey/survey.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [NonAuthGuard] },
  { path: 'survey', component: SurveyComponent, canActivate: [NonAuthGuard] },
  { path: 'onboarding', component: UserOnboardingComponent, canActivate: [NonAuthGuard] },
  { path: 'menu', component: MenuComponent, canActivate: [AuthGuard] },
  { path: 'news', component: NewsListComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }