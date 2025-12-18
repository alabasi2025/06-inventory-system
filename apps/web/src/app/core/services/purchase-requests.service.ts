import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface PurchaseRequest {
  id: string;
  request_no: string;
  warehouse_id: string;
  department_id?: string;
  priority: string;
  required_date?: string;
  reason?: string;
  total_estimated: number;
  status: string;
  notes?: string;
  warehouse?: any;
  items?: PurchaseRequestItem[];
  created_at: string;
}

export interface PurchaseRequestItem {
  id: string;
  item_id: string;
  quantity: number;
  estimated_price?: number;
  notes?: string;
  item?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<PurchaseRequest>> {
    return this.api.get<PaginatedResponse<PurchaseRequest>>('purchase-requests', params);
  }

  getById(id: string): Observable<PurchaseRequest> {
    return this.api.get<PurchaseRequest>(`purchase-requests/${id}`);
  }

  create(data: any): Observable<PurchaseRequest> {
    return this.api.post<PurchaseRequest>('purchase-requests', data);
  }

  update(id: string, data: any): Observable<PurchaseRequest> {
    return this.api.patch<PurchaseRequest>(`purchase-requests/${id}`, data);
  }

  submit(id: string): Observable<PurchaseRequest> {
    return this.api.post<PurchaseRequest>(`purchase-requests/${id}/submit`, {});
  }

  approve(id: string, notes?: string): Observable<PurchaseRequest> {
    return this.api.post<PurchaseRequest>(`purchase-requests/${id}/approve`, { notes });
  }

  reject(id: string, reason?: string): Observable<PurchaseRequest> {
    return this.api.post<PurchaseRequest>(`purchase-requests/${id}/reject`, { reason });
  }

  cancel(id: string): Observable<PurchaseRequest> {
    return this.api.post<PurchaseRequest>(`purchase-requests/${id}/cancel`, {});
  }
}
