import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Unit {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  symbol?: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Unit>> {
    return this.api.get<PaginatedResponse<Unit>>('units', params);
  }

  getById(id: string): Observable<Unit> {
    return this.api.get<Unit>(`units/${id}`);
  }

  create(data: Partial<Unit>): Observable<Unit> {
    return this.api.post<Unit>('units', data);
  }

  update(id: string, data: Partial<Unit>): Observable<Unit> {
    return this.api.patch<Unit>(`units/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`units/${id}`);
  }
}
