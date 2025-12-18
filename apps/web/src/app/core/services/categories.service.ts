import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  children?: Category[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Category>> {
    return this.api.get<PaginatedResponse<Category>>('categories', params);
  }

  getTree(): Observable<Category[]> {
    return this.api.get<Category[]>('categories/tree');
  }

  getById(id: string): Observable<Category> {
    return this.api.get<Category>(`categories/${id}`);
  }

  create(data: Partial<Category>): Observable<Category> {
    return this.api.post<Category>('categories', data);
  }

  update(id: string, data: Partial<Category>): Observable<Category> {
    return this.api.patch<Category>(`categories/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`categories/${id}`);
  }
}
