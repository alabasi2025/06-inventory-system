import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface PurchaseOrder {
  id: string;
  order_no: string;
  quotation_id?: string;
  supplier_id: string;
  warehouse_id: string;
  order_date: string;
  expected_date?: string;
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
  warehouse?: any;
  quotation?: any;
  items?: PurchaseOrderItem[];
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  item_id: string;
  quantity: number;
  received_qty: number;
  unit_price: number;
  discount_percent?: number;
  discount_amount?: number;
  total_price: number;
  notes?: string;
  item?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrdersService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<PurchaseOrder>> {
    return this.api.get<PaginatedResponse<PurchaseOrder>>('purchase-orders', params);
  }

  getById(id: string): Observable<PurchaseOrder> {
    return this.api.get<PurchaseOrder>(`purchase-orders/${id}`);
  }

  create(data: any): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>('purchase-orders', data);
  }

  createFromQuotation(quotationId: string, data: any): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/from-quotation/${quotationId}`, data);
  }

  update(id: string, data: any): Observable<PurchaseOrder> {
    return this.api.patch<PurchaseOrder>(`purchase-orders/${id}`, data);
  }

  approve(id: string): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/${id}/approve`, {});
  }

  send(id: string): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/${id}/send`, {});
  }

  cancel(id: string): Observable<PurchaseOrder> {
    return this.api.post<PurchaseOrder>(`purchase-orders/${id}/cancel`, {});
  }
}
