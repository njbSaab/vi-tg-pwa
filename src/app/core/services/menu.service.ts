// src/app/core/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuItem } from '../models/menu-items';
import { MenuPost } from '../models/post';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${environment.apiUrl}/api/menu/tables`);
  }

  getPostById(id: number): Observable<MenuPost> {
    return this.http.get<MenuPost>(`${environment.apiUrl}/api/menu/posts/${id}`);
  }

  getInlineButtons(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/menu-buttons-inline`);
  }

}

