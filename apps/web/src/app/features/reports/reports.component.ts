import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../core/services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">التقارير</h1>
      
      <!-- Report Types -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer" (click)="loadStockReport()">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">تقرير المخزون</h3>
              <p class="text-sm text-gray-500">أرصدة الأصناف في المستودعات</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer" (click)="loadLowStock()">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">أصناف تحت الحد الأدنى</h3>
              <p class="text-sm text-gray-500">الأصناف التي تحتاج إعادة طلب</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer" (click)="loadPurchasesReport()">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">تقرير المشتريات</h3>
              <p class="text-sm text-gray-500">إحصائيات المشتريات</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer" (click)="loadSuppliersPerformance()">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">أداء الموردين</h3>
              <p class="text-sm text-gray-500">تقييم وإحصائيات الموردين</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Report Content -->
      @if (activeReport) {
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-800">{{ activeReport }}</h2>
            <button (click)="activeReport = ''" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          @if (loading) {
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p class="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          } @else if (reportData) {
            <div class="overflow-x-auto">
              @if (activeReport === 'تقرير المخزون') {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الصنف</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المستودع</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الكمية</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">القيمة</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    @for (row of reportData; track $index) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ row.item?.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.warehouse?.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.quantity }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.quantity * row.avg_cost | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
              
              @if (activeReport === 'أصناف تحت الحد الأدنى') {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الصنف</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الكمية الحالية</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحد الأدنى</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">النقص</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    @for (row of reportData; track $index) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ row.item?.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.currentQty }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.item?.min_qty }}</td>
                        <td class="px-4 py-3 text-sm text-red-600">{{ row.item?.min_qty - row.currentQty }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
              
              @if (activeReport === 'أداء الموردين') {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المورد</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">عدد الأوامر</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">إجمالي المشتريات</th>
                      <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التقييم</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    @for (row of reportData; track $index) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm">{{ row.supplier?.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.ordersCount }}</td>
                        <td class="px-4 py-3 text-sm">{{ row.totalAmount | number:'1.2-2' }}</td>
                        <td class="px-4 py-3 text-sm">
                          @if (row.supplier?.rating) {
                            <span class="text-yellow-500">★</span> {{ row.supplier?.rating }}/5
                          } @else { - }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>
          } @else {
            <p class="text-center text-gray-500 py-8">لا توجد بيانات</p>
          }
        </div>
      }
    </div>
  `
})
export class ReportsComponent {
  private service = inject(ReportsService);
  activeReport = '';
  reportData: any[] = [];
  loading = false;

  loadStockReport() {
    this.activeReport = 'تقرير المخزون';
    this.loading = true;
    this.service.getStockReport().subscribe({
      next: (data) => { this.reportData = data.data || data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadLowStock() {
    this.activeReport = 'أصناف تحت الحد الأدنى';
    this.loading = true;
    this.service.getLowStockItems().subscribe({
      next: (data) => { this.reportData = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadPurchasesReport() {
    this.activeReport = 'تقرير المشتريات';
    this.loading = true;
    this.service.getPurchasesReport().subscribe({
      next: (data) => { this.reportData = data.data || data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadSuppliersPerformance() {
    this.activeReport = 'أداء الموردين';
    this.loading = true;
    this.service.getSuppliersPerformance().subscribe({
      next: (data) => { this.reportData = data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
