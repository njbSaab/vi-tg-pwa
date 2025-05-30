import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  standalone: false
})
export class WelcomeComponent implements OnInit {
  greetings: { text: string, image_url?: string, title_for_client?: string, greeting_text?: string }[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  showSurvey = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadGreetings();
  }

  loadGreetings(): void {
    this.isLoading = true;
    this.apiService.getGreetings().subscribe({
      next: (greetings) => {
        this.greetings = greetings;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Ошибка загрузки приветствия | Lỗi tải lời chào';
        this.isLoading = false;
      }
    });
  }

  startSurvey(): void {
    const userId = uuidv4();
    const currentDate = new Date().toISOString();
    this.saveToLocalStorage(userId, currentDate);
    this.showSurvey = true;
  }

  saveToLocalStorage(userId: string, createdDate: string): void {
    const preferences = {
      userId,
      createdDate,
      selectedCategories: []
    };
    try {
      localStorage.setItem('myApp_userPreferences', JSON.stringify(preferences));
      console.log('Initialized localStorage:', preferences);
    } catch (e) {
      console.error('Ошибка сохранения в localStorage:', e);
      this.errorMessage = 'Không thể lưu dữ liệu, vui lòng thử lại';
    }
  }

  onSurveySubmitted(): void {
    this.showSurvey = false;
    console.log('Survey submitted, current localStorage:', localStorage.getItem('myApp_userPreferences'));
  }
}