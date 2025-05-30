// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated(): boolean {
    return localStorage.getItem('isAuth') === 'true';
  }

  login(userId: string): void {
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAuth', 'true');
  }

  logout(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuth');
    localStorage.removeItem('myApp_userPreferences');
  }
}