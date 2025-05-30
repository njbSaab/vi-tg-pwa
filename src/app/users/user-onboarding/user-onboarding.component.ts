import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-user-onboarding',
  templateUrl: './user-onboarding.component.html',
  styleUrls: ['./user-onboarding.component.css'],
  standalone: false,
})
export class UserOnboardingComponent implements OnInit {
  nameForm: FormGroup;
  emailForm: FormGroup;
  codeForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  verificationAttempts = 3;
  generatedCode: string | null = null;
  resendDisabled = false;
  resendTimer = 60;
  @ViewChild('stepper') stepper!: MatStepper;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {
    this.nameForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^[^@]+$/)]]
    });
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      localStorage.setItem('userId', userId);
    }
    console.log('userId:', userId);
  }

  submitName(): void {
    if (this.nameForm.valid) {
      localStorage.setItem('firstName', this.nameForm.value.firstName);
      this.stepper.next();
    }
  }

  submitEmail(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const email = this.emailForm.value.email;
      const userId = localStorage.getItem('userId') || '';

      this.generatedCode = this.usersService.generateVerificationCode();
      console.log('Generated code:', this.generatedCode);

      this.usersService.requestVerificationCode(Number(userId), email, this.generatedCode).subscribe({
        next: () => {
          localStorage.setItem('email', email);
          this.errorMessage = null;
          this.isLoading = false;
          this.startResendTimer();
          this.stepper.next();
        },
        error: (err) => {
          console.error('Verification error:', err);
          this.errorMessage = 'Lỗi gửi mã xác minh';
          this.isLoading = false;
        }
      });
    }
  }

  resendCode(): void {
    if (!this.resendDisabled) {
      this.resendDisabled = true;
      this.submitEmail();
    }
  }

  startResendTimer(): void {
    this.resendTimer = 60;
    this.resendDisabled = true;
    const timer = setInterval(() => {
      this.resendTimer--;
      if (this.resendTimer <= 0) {
        this.resendDisabled = false;
        clearInterval(timer);
      }
    }, 1000);
  }

  submitCode(): void {
    if (this.codeForm.valid) {
      this.isLoading = true;
      const enteredCode = this.codeForm.value.code;

      if (enteredCode === this.generatedCode) {
        localStorage.setItem('isAuth', 'true');
        this.createUser();
      } else {
        this.verificationAttempts--;
        if (this.verificationAttempts > 0) {
          this.errorMessage = `Mã không đúng. Còn ${this.verificationAttempts} lần thử.`;
          this.isLoading = false;
        } else {
          this.errorMessage = 'Hết lượt thử. Vui lòng nhập lại email.';
          this.verificationAttempts = 3;
          this.emailForm.reset();
          this.codeForm.reset();
          this.stepper.selectedIndex = 1;
          this.isLoading = false;
        }
      }
    }
  }

  private createUser(): void {
    const userId = localStorage.getItem('userId');
    const firstName = localStorage.getItem('firstName') || '';
    const email = localStorage.getItem('email') || '';

    if (!userId || !firstName) {
      this.errorMessage = 'Lỗi: userId hoặc firstName không tồn tại';
      this.isLoading = false;
      return;
    }

    const userData = {
      id: Number(userId),
      first_name: firstName,
      email,
      state: 'email_getted',
      isNewsActive: true,
      isBot: false,
      canJoinGroups: true,
      canReadAllGroupMessages: true,
      supportsInlineQueries: false
    };

    console.log('Sending userData:', userData);

    this.usersService.createUser(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/menu']); // Перенаправляем на /menu
      },
      error: (err) => {
        console.error('Create user error:', err);
        this.errorMessage = 'Lỗi tạo người dùng';
        this.isLoading = false;
      }
    });
  }

  complete(): void {
    this.router.navigate(['/menu']);
  }
}