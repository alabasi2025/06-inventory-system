import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from './categories.service';

export interface Item {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  name_en?: string;
  category_id: string;
  unit_id: string;
  description?: string;
  min_qty: number;
  max_qty: number;
  reorder_point: number;
  avg_cost: number;
  last_cost: number;
  is_active: boolean;
  category?: any;
  unit?: any;
  created_at: string;
}

export interface ItemStock {
  item: Item;
  warehouses: {
    warehouse: any;
    quantity: number;
    available_qty: number;
    reserved_qty: number;
    avg_cost: number;
  }[];
  totalQuantity: number;
  totalValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  private api = inject(ApiService);

  getAll(params?: any): Observable<PaginatedResponse<Item>> {
    return this.api.get<PaginatedResponse<Item>>('items', params);
  }

  getById(id: string): Observable<Item> {
    return this.api.get<Item>(`items/${id}`);
  }

  getStock(id: string): Observable<ItemStock> {
    return this.api.get<ItemStock>(`items/${id}/stock`);
  }

  create(data: Partial<Item>): Observable<Item> {
    return this.api.post<Item>('items', data);
  }

  update(id: string, data: Partial<Item>): Observable<Item> {
    return this.api.patch<Item>(`items/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`items/${id}`);
  }
}
