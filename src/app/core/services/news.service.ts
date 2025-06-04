// src/app/core/services/news.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { News } from '../models/news';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsService {

  constructor(private http: HttpClient) {}

  getNews(): Observable<News[]> {
    return this.http.get<News[]>(`${environment.apiUrl}/api/news`);
  }

  getFilteredNews(selectedCategories: number[]): Observable<News[]> {
    return this.getNews().pipe(
      map((news: News[]) =>
        news.filter((item) => selectedCategories.includes(item.category.id))
      )
    );
  }
}