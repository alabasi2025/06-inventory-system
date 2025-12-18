import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Card, TableModule, Tag, Button],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1>مرحباً بك في نظام المخازن</h1>
          <p>إدارة شاملة للمخزون والمشتريات</p>
        </div>
        <div class="welcome-date">
          <i class="pi pi-calendar"></i>
          <span>{{ today | date:'EEEE, d MMMM yyyy':'':'ar' }}</span>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card" *ngFor="let stat of statsCards">
          <div class="stat-icon" [style.background]="stat.gradient">
            <i [class]="stat.icon"></i>
          </div>
          <div class="stat-details">
            <span class="stat-value">{{ stat.value | number }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
          <a [routerLink]="stat.link" class="stat-link" *ngIf="stat.link">
            <i class="pi pi-arrow-left"></i>
          </a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3><i class="pi pi-bolt"></i> إجراءات سريعة</h3>
        <div class="actions-grid">
          <a routerLink="/items" class="action-btn">
            <i class="pi pi-plus-circle"></i>
            <span>إضافة صنف</span>
          </a>
          <a routerLink="/movements" class="action-btn">
            <i class="pi pi-arrow-right-arrow-left"></i>
            <span>حركة جديدة</span>
          </a>
          <a routerLink="/purchase-orders" class="action-btn">
            <i class="pi pi-shopping-cart"></i>
            <span>أمر شراء</span>
          </a>
          <a routerLink="/suppliers" class="action-btn">
            <i class="pi pi-user-plus"></i>
            <span>إضافة مورد</span>
          </a>
        </div>
      </div>

      <!-- Data Tables Section -->
      <div class="tables-section">
        <!-- Low Stock Items -->
        <div class="table-card">
          <div class="table-header">
            <h3><i class="pi pi-exclamation-triangle"></i> أصناف منخفضة المخزون</h3>
            <a routerLink="/items" class="view-all">عرض الكل</a>
          </div>
          <div class="table-content">
            <p-table [value]="lowStockItems" [rows]="5" styleClass="p-datatable-sm custom-table">
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
                  <td><span class="code-badge">{{ item.code }}</span></td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.minStock }}</td>
                  <td><span class="stock-value" [class.critical]="item.currentStock === 0">{{ item.currentStock }}</span></td>
                  <td>
                    <p-tag [severity]="item.currentStock === 0 ? 'danger' : 'warn'" 
                           [value]="item.currentStock === 0 ? 'نفد' : 'منخفض'"
                           [rounded]="true"></p-tag>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="empty-message">
                    <i class="pi pi-check-circle"></i>
                    <span>جميع الأصناف بمستوى جيد</span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>

        <!-- Recent Movements -->
        <div class="table-card">
          <div class="table-header">
            <h3><i class="pi pi-history"></i> آخر الحركات</h3>
            <a routerLink="/movements" class="view-all">عرض الكل</a>
          </div>
          <div class="table-content">
            <p-table [value]="recentMovements" [rows]="5" styleClass="p-datatable-sm custom-table">
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
                  <td><span class="code-badge">{{ movement.movementNo }}</span></td>
                  <td>
                    <span class="movement-type" [attr.data-type]="movement.type">
                      <i [class]="getMovementIcon(movement.type)"></i>
                      {{ getMovementTypeLabel(movement.type) }}
                    </span>
                  </td>
                  <td>{{ movement.toWarehouse?.name || movement.fromWarehouse?.name || '-' }}</td>
                  <td>{{ movement.createdAt | date:'short':'':'ar' }}</td>
                  <td>
                    <p-tag [severity]="getStatusSeverity(movement.status)" 
                           [value]="getStatusLabel(movement.status)"
                           [rounded]="true"></p-tag>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="empty-message">
                    <i class="pi pi-inbox"></i>
                    <span>لا توجد حركات حتى الآن</span>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Welcome Section */
    .welcome-section {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
    }

    .welcome-content h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .welcome-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      padding: 0.75rem 1.25rem;
      border-radius: 2rem;
      font-size: 0.9rem;
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
      position: relative;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .stat-details {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .stat-link {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .stat-link:hover {
      background: #e2e8f0;
      color: #1e40af;
    }

    /* Quick Actions */
    .quick-actions {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }

    .quick-actions h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .quick-actions h3 i {
      color: #f59e0b;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem 1rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      text-decoration: none;
      color: #475569;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .action-btn:hover {
      background: #eff6ff;
      color: #1e40af;
      border-color: #bfdbfe;
    }

    .action-btn i {
      font-size: 1.5rem;
    }

    .action-btn span {
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Tables Section */
    .tables-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 1.5rem;
    }

    .table-card {
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .table-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .table-header h3 i {
      color: #64748b;
    }

    .view-all {
      font-size: 0.875rem;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .view-all:hover {
      color: #1e40af;
    }

    .table-content {
      padding: 0;
    }

    :host ::ng-deep .custom-table {
      border: none !important;
    }

    :host ::ng-deep .custom-table .p-datatable-thead > tr > th {
      background: #f8fafc;
      color: #64748b;
      font-weight: 600;
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      padding: 1rem 1.25rem;
      border: none;
      border-bottom: 1px solid #e2e8f0;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr > td {
      padding: 1rem 1.25rem;
      border: none;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.875rem;
      color: #334155;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr:last-child > td {
      border-bottom: none;
    }

    :host ::ng-deep .custom-table .p-datatable-tbody > tr:hover {
      background: #f8fafc;
    }

    .code-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-family: monospace;
    }

    .stock-value {
      font-weight: 600;
      color: #1e293b;
    }

    .stock-value.critical {
      color: #dc2626;
    }

    .movement-type {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .movement-type i {
      font-size: 0.875rem;
    }

    .empty-message {
      text-align: center;
      padding: 3rem 1rem !important;
      color: #94a3b8;
    }

    .empty-message i {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .empty-message span {
      display: block;
      font-size: 0.9375rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .welcome-section {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .tables-section {
        grid-template-columns: 1fr;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  summary: any = {};
  lowStockItems: any[] = [];
  recentMovements: any[] = [];

  statsCards: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.api.getDashboard().subscribe({
      next: (data) => {
        this.summary = data.summary;
        this.lowStockItems = data.lowStockItems;
        this.recentMovements = data.recentMovements;
        this.updateStatsCards();
      },
      error: (err) => console.error('Error loading dashboard:', err)
    });
  }

  updateStatsCards() {
    this.statsCards = [
      {
        label: 'التصنيفات',
        value: this.summary?.categories || 0,
        icon: 'pi pi-tags',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        link: '/categories'
      },
      {
        label: 'المستودعات',
        value: this.summary?.warehouses || 0,
        icon: 'pi pi-building',
        gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
        link: '/warehouses'
      },
      {
        label: 'الأصناف',
        value: this.summary?.items || 0,
        icon: 'pi pi-box',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        link: '/items'
      },
      {
        label: 'الموردين',
        value: this.summary?.suppliers || 0,
        icon: 'pi pi-users',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        link: '/suppliers'
      },
      {
        label: 'أوامر شراء معلقة',
        value: this.summary?.pendingOrders || 0,
        icon: 'pi pi-shopping-cart',
        gradient: 'linear-gradient(135deg, #ec4899, #db2777)',
        link: '/purchase-orders'
      },
      {
        label: 'قيمة المخزون (ر.س)',
        value: this.summary?.totalStockValue || 0,
        icon: 'pi pi-wallet',
        gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
        link: null
      }
    ];
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

  getMovementIcon(type: string): string {
    const icons: any = {
      receipt: 'pi pi-arrow-down',
      issue: 'pi pi-arrow-up',
      transfer: 'pi pi-arrows-h',
      adjustment: 'pi pi-sliders-h'
    };
    return icons[type] || 'pi pi-circle';
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
