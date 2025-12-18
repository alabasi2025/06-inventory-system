import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  type: string;
  location?: string;
  manager_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class WarehousesService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Warehouse>> {
    return this.api.get<PaginatedResponse<Warehouse>>('warehouses', params);
  }

  getById(id: string): Observable<Warehouse> {
    return this.api.get<Warehouse>(`warehouses/${id}`);
  }

  create(data: Partial<Warehouse>): Observable<Warehouse> {
    return this.api.post<Warehouse>('warehouses', data);
  }

  update(id: string, data: Partial<Warehouse>): Observable<Warehouse> {
    return this.api.patch<Warehouse>(`warehouses/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`warehouses/${id}`);
  }
}
