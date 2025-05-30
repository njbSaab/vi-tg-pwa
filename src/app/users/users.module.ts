import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponentsComponent } from './users-components/users-components.component';
import { UserOnboardingComponent } from './user-onboarding/user-onboarding.component'; // Импортируем
import { SharedModule } from '../shared/shared.module';
import { UsersService } from './users.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [UsersComponentsComponent, UserOnboardingComponent], // Убрали UserOnboardingComponent
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  providers: [UsersService],
  exports: [UsersComponentsComponent, UserOnboardingComponent] // Оставляем в exports
})
export class UsersModule {}