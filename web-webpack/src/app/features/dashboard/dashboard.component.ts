import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, TagModule],
  template: `
    <div class="dashboard">
      <h2>لوحة التحكم</h2>
      
      <div class="stats-grid">
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-tags stat-icon categories"></i>
            <div class="stat-info">
              <span class="stat-value">{{ summary?.categories || 0 }}</span>
              <span class="stat-label">التصنيفات</span>
            </div>
          </div>
        </p-card>
        
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-building stat-icon warehouses"></i>
            <div class="stat-info">
              <span class="stat-value">{{ summary?.warehouses || 0 }}</span>
              <span class="stat-label">المستودعات</span>
            </div>
          </div>
        </p-card>
        
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-box stat-icon items"></i>
            <div class="stat-info">
              <span class="stat-value">{{ summary?.items || 0 }}</span>
              <span class="stat-label">الأصناف</span>
            </div>
          </div>
        </p-card>
        
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-users stat-icon suppliers"></i>
            <div class="stat-info">
              <span class="stat-value">{{ summary?.suppliers || 0 }}</span>
              <span class="stat-label">الموردين</span>
            </div>
          </div>
        </p-card>
        
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-shopping-cart stat-icon orders"></i>
            <div class="stat-info">
              <span class="stat-value">{{ summary?.pendingOrders || 0 }}</span>
              <span class="stat-label">أوامر شراء معلقة</span>
            </div>
          </div>
        </p-card>
        
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <i class="pi pi-dollar stat-icon value"></i>
            <div class="stat-info">
              <span class="stat-value">{{ (summary?.totalStockValue || 0) | number:'1.0-0' }}</span>
              <span class="stat-label">قيمة المخزون (ر.س)</span>
            </div>
          </div>
        </p-card>
      </div>

      <div class="tables-grid">
        <p-card header="أصناف منخفضة المخزون" styleClass="table-card">
          <p-table [value]="lowStockItems" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>الكود</th>
                <th>الصنف</th>
                <th>الحد الأدنى</th>
                <th>الرصيد</th>
                <th>الحالة</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.minStock }}</td>
                <td>{{ item.currentStock }}</td>
                <td>
                  <p-tag [severity]="item.currentStock === 0 ? 'danger' : 'warn'" 
                         [value]="item.currentStock === 0 ? 'نفد' : 'منخفض'"></p-tag>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center">لا توجد أصناف منخفضة المخزون</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>

        <p-card header="آخر الحركات" styleClass="table-card">
          <p-table [value]="recentMovements" [rows]="5" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>رقم الحركة</th>
                <th>النوع</th>
                <th>المستودع</th>
                <th>الحالة</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-movement>
              <tr>
                <td>{{ movement.movementNo }}</td>
                <td>{{ getMovementTypeLabel(movement.type) }}</td>
                <td>{{ movement.toWarehouse || movement.fromWarehouse || '-' }}</td>
                <td>
                  <p-tag [severity]="getStatusSeverity(movement.status)" 
                         [value]="getStatusLabel(movement.status)"></p-tag>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center">لا توجد حركات</td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard h2 {
      margin-bottom: 1.5rem;
      color: #1e3a5f;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .stat-icon {
      font-size: 2.5rem;
      padding: 1rem;
      border-radius: 50%;
      color: white;
    }
    .stat-icon.categories { background: #6366f1; }
    .stat-icon.warehouses { background: #22c55e; }
    .stat-icon.items { background: #f59e0b; }
    .stat-icon.suppliers { background: #3b82f6; }
    .stat-icon.orders { background: #ec4899; }
    .stat-icon.value { background: #10b981; }
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: bold;
      color: #1e3a5f;
    }
    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
    }
    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1rem;
    }
    .text-center {
      text-align: center;
      color: #64748b;
      padding: 2rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: any = {};
  lowStockItems: any[] = [];
  recentMovements: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    console.log('Loading dashboard...');
    this.api.getDashboard().subscribe({
      next: (data) => {
        console.log('Dashboard data received:', data);
        this.summary = data.summary;
        this.lowStockItems = data.lowStockItems;
        this.recentMovements = data.recentMovements;
      },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  getMovementTypeLabel(type: string): string {
    const labels: any = {
      receipt: 'استلام',
      issue: 'صرف',
      transfer: 'تحويل',
      adjustment: 'تسوية'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      draft: 'مسودة',
      confirmed: 'مؤكد',
      cancelled: 'ملغي'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = {
      draft: 'warn',
      confirmed: 'success',
      cancelled: 'danger'
    };
    return severities[status] || 'info';
  }
}
