import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  type: string;
  tax_number?: string;
  commercial_reg?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  payment_terms?: string;
  credit_limit?: number;
  rating?: number;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Supplier>> {
    return this.api.get<PaginatedResponse<Supplier>>('suppliers', params);
  }

  getById(id: string): Observable<Supplier> {
    return this.api.get<Supplier>(`suppliers/${id}`);
  }

  create(data: Partial<Supplier>): Observable<Supplier> {
    return this.api.post<Supplier>('suppliers', data);
  }

  update(id: string, data: Partial<Supplier>): Observable<Supplier> {
    return this.api.patch<Supplier>(`suppliers/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`suppliers/${id}`);
  }

  updateRating(id: string, rating: number): Observable<Supplier> {
    return this.api.patch<Supplier>(`suppliers/${id}/rating`, { rating });
  }
}
