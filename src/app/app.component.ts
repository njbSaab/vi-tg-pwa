import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'vietget-pwa-dev';
  isAuth: boolean = false; // Булевая переменная вместо строки

  ngOnInit() {
    const isAuthLocal = localStorage.getItem('isAuth') || 'false';
    this.isAuth = isAuthLocal === 'true'; // Преобразуем строку в boolean
    console.log('isAuth:', this.isAuth);
  }
}