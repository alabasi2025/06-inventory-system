import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Quotation {
  id: string;
  quotation_no: string;
  request_id?: string;
  supplier_id: string;
  valid_until?: string;
  payment_terms?: string;
  delivery_terms?: string;
  subtotal: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  notes?: string;
  supplier?: any;
  request?: any;
  items?: QuotationItem[];
  created_at: string;
}

export interface QuotationItem {
  id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  discount_amount?: number;
  total_price: number;
  delivery_days?: number;
  notes?: string;
  item?: any;
}

@Injectable({
  providedIn: 'root'
})
export class QuotationsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Quotation>> {
    return this.api.get<PaginatedResponse<Quotation>>('quotations', params);
  }

  getById(id: string): Observable<Quotation> {
    return this.api.get<Quotation>(`quotations/${id}`);
  }

  create(data: any): Observable<Quotation> {
    return this.api.post<Quotation>('quotations', data);
  }

  update(id: string, data: any): Observable<Quotation> {
    return this.api.patch<Quotation>(`quotations/${id}`, data);
  }

  markReceived(id: string): Observable<Quotation> {
    return this.api.post<Quotation>(`quotations/${id}/receive`, {});
  }

  accept(id: string): Observable<Quotation> {
    return this.api.post<Quotation>(`quotations/${id}/accept`, {});
  }

  reject(id: string, reason?: string): Observable<Quotation> {
    return this.api.post<Quotation>(`quotations/${id}/reject`, { reason });
  }

  compare(requestId: string): Observable<any> {
    return this.api.get<any>(`quotations/compare/${requestId}`);
  }
}
