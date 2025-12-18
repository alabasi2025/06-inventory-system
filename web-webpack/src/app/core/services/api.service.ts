import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Categories
  getCategories(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/categories`, { params: this.buildParams(params) });
  }

  getCategoryTree(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/categories/tree`);
  }

  getCategory(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, data);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  // Units
  getUnits(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/units`, { params: this.buildParams(params) });
  }

  getUnit(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/units/${id}`);
  }

  createUnit(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/units`, data);
  }

  updateUnit(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/units/${id}`, data);
  }

  deleteUnit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/units/${id}`);
  }

  // Warehouses
  getWarehouses(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/warehouses`, { params: this.buildParams(params) });
  }

  getWarehouse(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/warehouses/${id}`);
  }

  getWarehouseStock(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/warehouses/${id}/stock`);
  }

  createWarehouse(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/warehouses`, data);
  }

  updateWarehouse(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/warehouses/${id}`, data);
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/warehouses/${id}`);
  }

  // Items
  getItems(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/items`, { params: this.buildParams(params) });
  }

  getItem(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/items/${id}`);
  }

  getItemStock(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/${id}/stock`);
  }

  getItemMovements(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/items/${id}/movements`);
  }

  createItem(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/items`, data);
  }

  updateItem(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/items/${id}`, data);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
  }

  // Suppliers
  getSuppliers(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/suppliers`, { params: this.buildParams(params) });
  }

  getSupplier(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/suppliers/${id}`);
  }

  getSupplierOrders(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/suppliers/${id}/orders`);
  }

  createSupplier(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/suppliers`, data);
  }

  updateSupplier(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/suppliers/${id}`, data);
  }

  deleteSupplier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/suppliers/${id}`);
  }

  // Movements
  getMovements(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/movements`, { params: this.buildParams(params) });
  }

  getMovement(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/movements/${id}`);
  }

  createMovement(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/movements`, data);
  }

  updateMovement(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/movements/${id}`, data);
  }

  confirmMovement(id: string, confirmedBy: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/movements/${id}/confirm`, { confirmedBy });
  }

  cancelMovement(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/movements/${id}/cancel`, {});
  }

  // Purchase Orders
  getPurchaseOrders(params?: any): Observable<PaginatedResponse<any>> {
    return this.http.get<PaginatedResponse<any>>(`${this.baseUrl}/purchase-orders`, { params: this.buildParams(params) });
  }

  getPurchaseOrder(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  createPurchaseOrder(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders`, data);
  }

  updatePurchaseOrder(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/purchase-orders/${id}`, data);
  }

  approvePurchaseOrder(id: string, approvedBy: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/${id}/approve`, { approvedBy });
  }

  sendPurchaseOrder(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/${id}/send`, {});
  }

  receivePurchaseOrder(id: string, warehouseId: string, receivedBy: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/purchase-orders/${id}/receive`, { warehouseId, receivedBy });
  }

  // Dashboard
  getDashboard(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  getLowStockItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/low-stock`);
  }

  getStockReport(warehouseId?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/stock-report`, { params: this.buildParams({ warehouseId }) });
  }

  getMovementReport(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dashboard/movement-report`, { params: this.buildParams(params) });
  }

  getPurchaseReport(params?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/purchase-report`, { params: this.buildParams(params) });
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
