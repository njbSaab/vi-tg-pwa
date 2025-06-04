import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/category';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css'],
  standalone: false
})
export class SurveyComponent implements OnInit {
  categories: Category[] = [];
  selectedIds: number[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  @Output() surveySubmitted = new EventEmitter<number[]>();

  private imageMap: { [key: string]: string } = {
    football: 'https://i.ibb.co/dvxHRBN/foo.png',
    basketball: 'https://i.ibb.co/TBB6nZnr/bak.png',
    baseball: 'https://i.ibb.co/WNtmqyCq/bas.png',
    tennis: 'https://i.ibb.co/Nnf5PZz8/ten.png',
    horse: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_cf6d7c93c1de494515c1a437b014987d.webp',
    easport: 'https://i.ibb.co/cS0xKnyH/ea.png'
  };

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
    const savedData = localStorage.getItem('myApp_userPreferences');
    if (savedData) {
      const preferences = JSON.parse(savedData);
      this.selectedIds = preferences.selectedCategories || [];
      console.log('Loaded preferences from localStorage:', preferences);
    }
  }

  toggleCategory(id: number): void {
    if (this.selectedIds.includes(id)) {
      this.selectedIds = this.selectedIds.filter(catId => catId !== id);
    } else {
      this.selectedIds.push(id);
    }
    this.errorMessage = null;
    console.log('Current selected IDs:', this.selectedIds);
    this.saveToLocalStorage();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.apiService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories.map(category => ({
          ...category,
          image_url: this.imageMap[category.name] || 'https://i.ibb.co/dummy/default.png'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.errorMessage = 'Ошибка загрузки категорий | Lỗi tải danh mục';
        this.isLoading = false;
      }
    });
  }

  saveToLocalStorage(): void {
    let preferences = {
      userId: uuidv4(),
      createdDate: new Date().toISOString(),
      selectedCategories: [...this.selectedIds]
    };
    const savedData = localStorage.getItem('myApp_userPreferences');
    if (savedData) {
      const existing = JSON.parse(savedData);
      preferences = {
        userId: existing.userId || preferences.userId,
        createdDate: existing.createdDate || preferences.createdDate,
        selectedCategories: [...this.selectedIds]
      };
    }
    try {
      localStorage.setItem('myApp_userPreferences', JSON.stringify(preferences));
      console.log('Saved to localStorage:', preferences);
    } catch (e) {
      console.error('Ошибка сохранения в localStorage:', e);
      this.errorMessage = 'Không thể lưu dữ liệu, vui lòng thử lại';
    }
  }

  submitSurvey(): void {
    if (this.selectedIds.length > 0) {
      this.isLoading = true;
      console.log('Submitting categories:', this.selectedIds);
      this.saveToLocalStorage();
      console.log('localStorage before emit:', localStorage.getItem('myApp_userPreferences'));
      this.surveySubmitted.emit(this.selectedIds);
      this.isLoading = false;
      this.router.navigate(['/onboarding']);
    } else {
      this.errorMessage = 'Пожалуйста, выберите хотя бы одну категорию | Vui lòng chọn ít nhất một danh mục';
    }
  }
}