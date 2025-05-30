import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from './models/user';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly SECRET_KEY = 'kX9pQz7mW2rY8tL4jN6vB3xA0cF2uI9o';

  constructor(private http: HttpClient) {}

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  encryptCode(code: string): string {
    return CryptoJS.AES.encrypt(code, this.SECRET_KEY).toString();
  }

  createUser(userData: any): Observable<any> { // Изменено на any для гибкости
    return this.http.post(`${environment.apiUrl}/users`, userData);
  }

  requestVerificationCode(userId: number, email: string, code: string): Observable<void> {
    const encryptedCode = this.encryptCode(code);
    return this.http
      .post<{ success: boolean; message: string }>('https://top4winners.top/vietget/verify', {
        site_url: 'https://t.me/vietget_online_bot',
        email_user: email,
        encrypted_code: encryptedCode,
        user_id: userId
      })
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message);
          }
        })
      );
  }
}