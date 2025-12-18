import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface DashboardData {
  summary: {
    totalItems: number;
    totalWarehouses: number;
    totalSuppliers: number;
    lowStockItems: number;
    pendingPurchaseRequests: number;
    pendingPurchaseOrders: number;
    stockValue: number;
  };
  recentMovements: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private api = inject(ApiService);

  getDashboard(): Observable<DashboardData> {
    return this.api.get<DashboardData>('reports/dashboard');
  }

  getStockReport(params?: any): Observable<any> {
    return this.api.get<any>('reports/stock', params);
  }

  getLowStockItems(): Observable<any[]> {
    return this.api.get<any[]>('reports/stock/low');
  }

  getMovementsReport(params?: any): Observable<any> {
    return this.api.get<any>('reports/stock/movements', params);
  }

  getExpiryReport(params?: any): Observable<any[]> {
    return this.api.get<any[]>('reports/stock/expiry', params);
  }

  getPurchasesReport(params?: any): Observable<any> {
    return this.api.get<any>('reports/purchases', params);
  }

  getSuppliersPerformance(params?: any): Observable<any[]> {
    return this.api.get<any[]>('reports/suppliers/performance', params);
  }

  getItemHistory(itemId: string, params?: any): Observable<any[]> {
    return this.api.get<any[]>(`reports/items/${itemId}/history`, params);
  }
}
