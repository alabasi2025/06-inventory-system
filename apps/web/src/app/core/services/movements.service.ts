import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Movement {
  id: string;
  movement_no: string;
  type: 'receipt' | 'issue' | 'transfer' | 'adjustment';
  warehouse_id: string;
  to_warehouse_id?: string;
  reference_type?: string;
  reference_id?: string;
  movement_date: string;
  status: string;
  notes?: string;
  warehouse?: any;
  to_warehouse?: any;
  items?: MovementItem[];
  created_at: string;
}

export interface MovementItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  batch_no?: string;
  serial_no?: string;
  expiry_date?: string;
  notes?: string;
  item?: any;
}

@Injectable({
  providedIn: 'root'
})
export class MovementsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Movement>> {
    return this.api.get<PaginatedResponse<Movement>>('movements', params);
  }

  getById(id: string): Observable<Movement> {
    return this.api.get<Movement>(`movements/${id}`);
  }

  create(data: any): Observable<Movement> {
    return this.api.post<Movement>('movements', data);
  }

  update(id: string, data: any): Observable<Movement> {
    return this.api.patch<Movement>(`movements/${id}`, data);
  }

  confirm(id: string): Observable<Movement> {
    return this.api.post<Movement>(`movements/${id}/confirm`, {});
  }

  cancel(id: string): Observable<Movement> {
    return this.api.post<Movement>(`movements/${id}/cancel`, {});
  }
}
