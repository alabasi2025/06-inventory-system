import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface GoodsReceipt {
  id: string;
  receipt_no: string;
  order_id: string;
  receipt_date: string;
  gate_pass_no?: string;
  supplier_invoice_no?: string;
  status: string;
  notes?: string;
  order?: any;
  items?: GoodsReceiptItem[];
  created_at: string;
}

export interface GoodsReceiptItem {
  id: string;
  order_item_id: string;
  received_qty: number;
  rejected_qty?: number;
  rejection_reason?: string;
  batch_no?: string;
  serial_no?: string;
  expiry_date?: string;
  notes?: string;
  order_item?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GoodsReceiptsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<GoodsReceipt>> {
    return this.api.get<PaginatedResponse<GoodsReceipt>>('goods-receipts', params);
  }

  getById(id: string): Observable<GoodsReceipt> {
    return this.api.get<GoodsReceipt>(`goods-receipts/${id}`);
  }

  create(data: any): Observable<GoodsReceipt> {
    return this.api.post<GoodsReceipt>('goods-receipts', data);
  }

  update(id: string, data: any): Observable<GoodsReceipt> {
    return this.api.patch<GoodsReceipt>(`goods-receipts/${id}`, data);
  }

  confirm(id: string): Observable<GoodsReceipt> {
    return this.api.post<GoodsReceipt>(`goods-receipts/${id}/confirm`, {});
  }

  cancel(id: string): Observable<GoodsReceipt> {
    return this.api.post<GoodsReceipt>(`goods-receipts/${id}/cancel`, {});
  }
}
