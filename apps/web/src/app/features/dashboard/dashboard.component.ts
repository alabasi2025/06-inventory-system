import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportsService, DashboardData } from '../../core/services/reports.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-blue-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">إجمالي الأصناف</p>
              <p class="text-3xl font-bold text-gray-800">{{ data?.summary?.totalItems || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-green-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">المستودعات</p>
              <p class="text-3xl font-bold text-gray-800">{{ data?.summary?.totalWarehouses || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-yellow-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">الموردين</p>
              <p class="text-3xl font-bold text-gray-800">{{ data?.summary?.totalSuppliers || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 border-r-4 border-red-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">أصناف تحت الحد الأدنى</p>
              <p class="text-3xl font-bold text-gray-800">{{ data?.summary?.lowStockItems || 0 }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Second Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">طلبات الشراء المعلقة</h3>
            <span class="text-2xl font-bold text-orange-600">{{ data?.summary?.pendingPurchaseRequests || 0 }}</span>
          </div>
          <a routerLink="/purchase-requests" class="text-blue-600 text-sm hover:underline">عرض الكل</a>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">أوامر الشراء المعلقة</h3>
            <span class="text-2xl font-bold text-purple-600">{{ data?.summary?.pendingPurchaseOrders || 0 }}</span>
          </div>
          <a routerLink="/purchase-orders" class="text-blue-600 text-sm hover:underline">عرض الكل</a>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-gray-800">قيمة المخزون</h3>
            <span class="text-2xl font-bold text-green-600">{{ (data?.summary?.stockValue || 0) | number:'1.2-2' }} ر.س</span>
          </div>
          <a routerLink="/reports" class="text-blue-600 text-sm hover:underline">تقرير المخزون</a>
        </div>
      </div>
      
      <!-- Recent Movements -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">آخر حركات المخزون</h3>
        
        @if (data?.recentMovements?.length) {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الحركة</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">النوع</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المستودع</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التاريخ</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                @for (movement of data?.recentMovements; track movement.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm">{{ movement.movement_no }}</td>
                    <td class="px-4 py-3 text-sm">{{ getMovementType(movement.type) }}</td>
                    <td class="px-4 py-3 text-sm">{{ movement.warehouse?.name }}</td>
                    <td class="px-4 py-3 text-sm">{{ movement.movement_date | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClass(movement.status)">
                        {{ getStatusLabel(movement.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p class="text-gray-500 text-center py-8">لا توجد حركات حديثة</p>
        }
      </div>
      
      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h3 class="font-semibold text-gray-800 mb-4">إجراءات سريعة</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a routerLink="/items" [queryParams]="{action: 'new'}" 
             class="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="text-sm text-gray-700">إضافة صنف</span>
          </a>
          
          <a routerLink="/movements" [queryParams]="{action: 'new', type: 'receipt'}"
             class="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            <span class="text-sm text-gray-700">استلام مخزون</span>
          </a>
          
          <a routerLink="/movements" [queryParams]="{action: 'new', type: 'issue'}"
             class="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
            <span class="text-sm text-gray-700">صرف مخزون</span>
          </a>
          
          <a routerLink="/purchase-requests" [queryParams]="{action: 'new'}"
             class="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span class="text-sm text-gray-700">طلب شراء جديد</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private reportsService = inject(ReportsService);
  data: DashboardData | null = null;

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.reportsService.getDashboard().subscribe({
      next: (data) => this.data = data,
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  getMovementType(type: string): string {
    const types: Record<string, string> = {
      'receipt': 'استلام',
      'issue': 'صرف',
      'transfer': 'تحويل',
      'adjustment': 'تسوية'
    };
    return types[type] || type;
  }

  getStatusLabel(status: string): string {
    const statuses: Record<string, string> = {
      'draft': 'مسودة',
      'confirmed': 'مؤكد',
      'cancelled': 'ملغى'
    };
    return statuses[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'draft': 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs',
      'confirmed': 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs',
      'cancelled': 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'
    };
    return classes[status] || 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs';
  }
}
