import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { MenuComponent } from './pages/menu/menu.component';
import { SurveyComponent } from './components/survey/survey.component';
import { AuthGuard } from './auth.guard';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { NonAuthGuard } from './non-auth.guard';

@NgModule({
  declarations: [
    WelcomeComponent,
    MenuComponent,
    SurveyComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    AuthGuard,
    ApiService,
    AuthService,
    NonAuthGuard
  ]
})
export class CoreModule { }