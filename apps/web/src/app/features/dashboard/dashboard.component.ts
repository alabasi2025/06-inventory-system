import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportsService, DashboardData } from '../../core/services/reports.service';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    ProgressSpinnerModule,
    MessageModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-left"></p-toast>
    
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
      
      <!-- Loading State -->
      @if (loading) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (i of [1,2,3,4]; track i) {
            <p-card styleClass="shadow-sm">
              <div class="flex items-center gap-4">
                <p-skeleton shape="circle" size="3rem"></p-skeleton>
                <div class="flex-1">
                  <p-skeleton width="60%" height="1rem" styleClass="mb-2"></p-skeleton>
                  <p-skeleton width="40%" height="2rem"></p-skeleton>
                </div>
              </div>
            </p-card>
          }
        </div>
      }
      
      <!-- Error State -->
      @if (error && !loading) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i class="pi pi-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button pButton label="إعادة المحاولة" icon="pi pi-refresh" 
                  class="p-button-outlined p-button-danger" (click)="loadDashboard()"></button>
        </div>
      }
      
      <!-- Data Loaded -->
      @if (!loading && !error && data) {
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <p-card styleClass="shadow-sm border-r-4 border-blue-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">إجمالي الأصناف</p>
                <p class="text-3xl font-bold text-gray-800">{{ data.summary?.totalItems || 0 | number }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="pi pi-box text-blue-600 text-xl"></i>
              </div>
            </div>
          </p-card>
          
          <p-card styleClass="shadow-sm border-r-4 border-green-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">المستودعات</p>
                <p class="text-3xl font-bold text-gray-800">{{ data.summary?.totalWarehouses || 0 | number }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i class="pi pi-building text-green-600 text-xl"></i>
              </div>
            </div>
          </p-card>
          
          <p-card styleClass="shadow-sm border-r-4 border-yellow-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">الموردين</p>
                <p class="text-3xl font-bold text-gray-800">{{ data.summary?.totalSuppliers || 0 | number }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i class="pi pi-users text-yellow-600 text-xl"></i>
              </div>
            </div>
          </p-card>
          
          <p-card styleClass="shadow-sm border-r-4 border-red-500">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">أصناف تحت الحد الأدنى</p>
                <p class="text-3xl font-bold text-gray-800">{{ data.summary?.lowStockItems || 0 | number }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i class="pi pi-exclamation-triangle text-red-600 text-xl"></i>
              </div>
            </div>
          </p-card>
        </div>
        
        <!-- Second Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <p-card styleClass="shadow-sm">
            <ng-template pTemplate="header">
              <div class="p-3 border-b">
                <h3 class="font-semibold text-gray-800">طلبات الشراء المعلقة</h3>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-orange-600 mb-2">{{ data.summary?.pendingPurchaseRequests || 0 }}</p>
              <a routerLink="/purchase-requests" class="text-blue-500 hover:underline text-sm">
                <i class="pi pi-arrow-left ml-1"></i> عرض الكل
              </a>
            </div>
          </p-card>
          
          <p-card styleClass="shadow-sm">
            <ng-template pTemplate="header">
              <div class="p-3 border-b">
                <h3 class="font-semibold text-gray-800">أوامر الشراء المعلقة</h3>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-purple-600 mb-2">{{ data.summary?.pendingPurchaseOrders || 0 }}</p>
              <a routerLink="/purchase-orders" class="text-blue-500 hover:underline text-sm">
                <i class="pi pi-arrow-left ml-1"></i> عرض الكل
              </a>
            </div>
          </p-card>
          
          <p-card styleClass="shadow-sm">
            <ng-template pTemplate="header">
              <div class="p-3 border-b">
                <h3 class="font-semibold text-gray-800">قيمة المخزون</h3>
              </div>
            </ng-template>
            <div class="text-center py-4">
              <p class="text-4xl font-bold text-green-600 mb-2">{{ (data.summary?.stockValue || 0) | number:'1.2-2' }}</p>
              <span class="text-gray-500">ر.س</span>
            </div>
          </p-card>
        </div>
        
        <!-- Recent Movements Table with PrimeNG -->
        <p-card styleClass="shadow-sm">
          <ng-template pTemplate="header">
            <div class="p-3 border-b flex items-center justify-between">
              <h3 class="font-semibold text-gray-800">آخر حركات المخزون</h3>
              <a routerLink="/movements" class="text-blue-500 hover:underline text-sm">
                عرض الكل <i class="pi pi-arrow-left mr-1"></i>
              </a>
            </div>
          </ng-template>
          
          @if (data.recentMovements && data.recentMovements.length > 0) {
            <p-table [value]="data.recentMovements" [rows]="5" styleClass="p-datatable-sm p-datatable-striped">
              <ng-template pTemplate="header">
                <tr>
                  <th>رقم الحركة</th>
                  <th>النوع</th>
                  <th>المستودع</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-movement>
                <tr>
                  <td class="font-medium">{{ movement.movement_no }}</td>
                  <td>
                    <span [class]="getMovementTypeClass(movement.type)">
                      {{ getMovementType(movement.type) }}
                    </span>
                  </td>
                  <td>{{ movement.warehouse?.name }}</td>
                  <td>{{ movement.movement_date | date:'yyyy-MM-dd' }}</td>
                  <td>
                    <span [class]="getStatusClass(movement.status)">
                      {{ getStatusLabel(movement.status) }}
                    </span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center py-8 text-gray-500">لا توجد حركات حديثة</td>
                </tr>
              </ng-template>
            </p-table>
          } @else {
            <div class="text-center py-8 text-gray-500">
              <i class="pi pi-inbox text-4xl mb-3 text-gray-300"></i>
              <p>لا توجد حركات حديثة</p>
            </div>
          }
        </p-card>
        
        <!-- Quick Actions with PrimeNG Buttons -->
        <p-card styleClass="shadow-sm">
          <ng-template pTemplate="header">
            <div class="p-3 border-b">
              <h3 class="font-semibold text-gray-800">إجراءات سريعة</h3>
            </div>
          </ng-template>
          <div class="flex flex-wrap gap-3 p-2">
            <button pButton label="إضافة صنف" icon="pi pi-plus" 
                    routerLink="/items" class="p-button-primary"></button>
            <button pButton label="استلام مخزون" icon="pi pi-download" 
                    routerLink="/movements" [queryParams]="{type: 'receipt'}" class="p-button-success"></button>
            <button pButton label="صرف مخزون" icon="pi pi-upload" 
                    routerLink="/movements" [queryParams]="{type: 'issue'}" class="p-button-warning"></button>
            <button pButton label="طلب شراء جديد" icon="pi pi-shopping-cart" 
                    routerLink="/purchase-requests" class="p-button-info"></button>
            <button pButton label="تقارير" icon="pi pi-chart-bar" 
                    routerLink="/reports" class="p-button-secondary"></button>
          </div>
        </p-card>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private reportsService = inject(ReportsService);
  private messageService = inject(MessageService);
  
  data: DashboardData | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.error = null;
    
    this.reportsService.getDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ في التحميل',
          detail: this.error || 'خطأ غير معروف',
          life: 5000
        });
      }
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

  getMovementTypeClass(type: string): string {
    const classes: Record<string, string> = {
      'receipt': 'px-2 py-1 bg-green-100 text-green-700 rounded text-xs',
      'issue': 'px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs',
      'transfer': 'px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs',
      'adjustment': 'px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs'
    };
    return classes[type] || 'px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs';
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
