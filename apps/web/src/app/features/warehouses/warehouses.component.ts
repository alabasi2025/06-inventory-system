import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { PAGE_STYLES } from '../../shared/styles/page-styles';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, ToggleSwitch, Toast, ConfirmDialog, Tag, InputIcon, IconField
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a)">
            <i class="pi pi-building"></i>
          </div>
          <div class="header-text">
            <h1>المستودعات</h1>
            <p>إدارة مستودعات التخزين والمواقع</p>
          </div>
        </div>
        <button pButton label="إضافة مستودع" icon="pi pi-plus" 
                class="p-button-primary" (click)="openNew()"></button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input pInputText type="text" [(ngModel)]="searchTerm" 
                 (input)="onSearch($event)" placeholder="بحث في المستودعات..." 
                 class="search-input" />
        </p-iconfield>
        <div class="filter-info">
          <span class="total-count">{{ warehouses.length }} مستودع</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <p-table [value]="filteredWarehouses" [paginator]="true" [rows]="10" 
                 [loading]="loading" [rowHover]="true"
                 [showCurrentPageReport]="true" currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords}"
                 styleClass="p-datatable-striped modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="code" style="width: 120px">
                الكود <p-sortIcon field="code"></p-sortIcon>
              </th>
              <th pSortableColumn="name">
                الاسم <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th style="width: 100px" class="text-center">النوع</th>
              <th>العنوان</th>
              <th style="width: 100px" class="text-center">الهاتف</th>
              <th style="width: 100px" class="text-center">عدد الأصناف</th>
              <th style="width: 100px" class="text-center">الحالة</th>
              <th style="width: 120px" class="text-center">الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-warehouse>
            <tr>
              <td><span class="code-badge">{{ warehouse.code }}</span></td>
              <td>
                <div class="warehouse-info">
                  <span class="name-primary">{{ warehouse.name }}</span>
                  <span class="name-secondary" *ngIf="warehouse.nameEn">{{ warehouse.nameEn }}</span>
                </div>
              </td>
              <td class="text-center">
                <p-tag [value]="getTypeLabel(warehouse.type)" 
                       [severity]="getTypeSeverity(warehouse.type)"
                       [rounded]="true"></p-tag>
              </td>
              <td>
                <span class="address-text" *ngIf="warehouse.address">
                  <i class="pi pi-map-marker"></i>
                  {{ warehouse.address }}
                </span>
                <span *ngIf="!warehouse.address" class="no-data">-</span>
              </td>
              <td class="text-center">
                <span *ngIf="warehouse.phone" class="phone-text">{{ warehouse.phone }}</span>
                <span *ngIf="!warehouse.phone" class="no-data">-</span>
              </td>
              <td class="text-center">
                <span class="count-badge">{{ warehouse._count?.stocks || 0 }}</span>
              </td>
              <td class="text-center">
                <p-tag [severity]="warehouse.isActive ? 'success' : 'danger'" 
                       [value]="warehouse.isActive ? 'فعال' : 'غير فعال'"
                       [rounded]="true"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-sm"
                          pTooltip="تعديل" tooltipPosition="top"
                          (click)="editWarehouse(warehouse)"></button>
                  <button pButton icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger p-button-sm"
                          pTooltip="حذف" tooltipPosition="top"
                          (click)="deleteWarehouse(warehouse)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-state">
                <div class="empty-content">
                  <i class="pi pi-building"></i>
                  <h4>لا توجد مستودعات</h4>
                  <p>ابدأ بإضافة مستودع جديد</p>
                  <button pButton label="إضافة مستودع" icon="pi pi-plus" 
                          class="p-button-outlined" (click)="openNew()"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="warehouseDialog" [header]="editMode ? 'تعديل مستودع' : 'إضافة مستودع جديد'" 
              [modal]="true" [style]="{width: '550px'}" styleClass="modern-dialog">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <div class="form-field">
            <label for="code">الكود <span class="required">*</span></label>
            <input pInputText id="code" [(ngModel)]="warehouse.code" 
                   [disabled]="editMode" placeholder="مثال: WH-001" />
            <small class="field-hint" *ngIf="!editMode">الكود فريد ولا يمكن تغييره لاحقاً</small>
          </div>
          
          <div class="form-field">
            <label for="type">النوع <span class="required">*</span></label>
            <p-select [options]="warehouseTypes" [(ngModel)]="warehouse.type" 
                      optionLabel="label" optionValue="value"
                      styleClass="w-full"></p-select>
          </div>
          
          <div class="form-field">
            <label for="name">الاسم (عربي) <span class="required">*</span></label>
            <input pInputText id="name" [(ngModel)]="warehouse.name" 
                   placeholder="اسم المستودع بالعربية" />
          </div>
          
          <div class="form-field">
            <label for="nameEn">الاسم (إنجليزي)</label>
            <input pInputText id="nameEn" [(ngModel)]="warehouse.nameEn" 
                   placeholder="Warehouse name in English" dir="ltr" />
          </div>
          
          <div class="form-field full-width">
            <label for="address">العنوان</label>
            <input pInputText id="address" [(ngModel)]="warehouse.address" 
                   placeholder="عنوان المستودع" />
          </div>
          
          <div class="form-field">
            <label for="phone">الهاتف</label>
            <input pInputText id="phone" [(ngModel)]="warehouse.phone" 
                   placeholder="رقم الهاتف" dir="ltr" />
          </div>
          
          <div class="form-field">
            <label for="email">البريد الإلكتروني</label>
            <input pInputText id="email" [(ngModel)]="warehouse.email" 
                   placeholder="email@example.com" dir="ltr" />
          </div>
          
          <div class="form-field-switch">
            <p-toggleswitch [(ngModel)]="warehouse.isActive"></p-toggleswitch>
            <label>المستودع فعال</label>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="إلغاء" icon="pi pi-times" 
                  class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="حفظ" icon="pi pi-check" 
                  class="p-button-primary" (click)="saveWarehouse()"
                  [loading]="saving"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [PAGE_STYLES + `
    .warehouse-info {
      display: flex;
      flex-direction: column;
    }

    .name-primary {
      font-weight: 500;
      color: #1e293b;
    }

    .name-secondary {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.125rem;
    }

    .address-text {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #475569;
      font-size: 0.875rem;
    }

    .address-text i {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .phone-text {
      font-family: monospace;
      color: #475569;
    }

    .no-data {
      color: #cbd5e1;
    }

    .count-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.625rem;
      border-radius: 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
    }
  `]
})
export class WarehousesComponent implements OnInit {
  warehouses: any[] = [];
  filteredWarehouses: any[] = [];
  warehouse: any = {};
  warehouseDialog = false;
  editMode = false;
  loading = false;
  saving = false;
  searchTerm = '';

  warehouseTypes = [
    { label: 'رئيسي', value: 'main' },
    { label: 'فرعي', value: 'sub' },
    { label: 'عبور', value: 'transit' }
  ];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.loading = true;
    this.api.getWarehouses({ take: 100 }).subscribe({
      next: (res) => {
        this.warehouses = res.data;
        this.filteredWarehouses = [...this.warehouses];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل المستودعات' });
      }
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredWarehouses = this.warehouses.filter(w => 
      w.code.toLowerCase().includes(term) ||
      w.name.toLowerCase().includes(term) ||
      (w.nameEn && w.nameEn.toLowerCase().includes(term)) ||
      (w.address && w.address.toLowerCase().includes(term))
    );
  }

  getTypeLabel(type: string): string {
    const labels: any = { main: 'رئيسي', sub: 'فرعي', transit: 'عبور' };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { main: 'success', sub: 'info', transit: 'warn' };
    return severities[type] || 'info';
  }

  openNew() {
    this.warehouse = { type: 'main', isActive: true };
    this.editMode = false;
    this.warehouseDialog = true;
  }

  editWarehouse(warehouse: any) {
    this.warehouse = { ...warehouse };
    this.editMode = true;
    this.warehouseDialog = true;
  }

  deleteWarehouse(warehouse: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المستودع "${warehouse.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteWarehouse(warehouse.id).subscribe({
          next: () => {
            this.loadWarehouses();
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المستودع بنجاح' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حذف المستودع' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.warehouseDialog = false;
  }

  saveWarehouse() {
    if (!this.warehouse.code || !this.warehouse.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.saving = true;
    const action = this.editMode
      ? this.api.updateWarehouse(this.warehouse.id, this.warehouse)
      : this.api.createWarehouse(this.warehouse);

    action.subscribe({
      next: () => {
        this.loadWarehouses();
        this.hideDialog();
        this.saving = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'تم', 
          detail: this.editMode ? 'تم تحديث المستودع بنجاح' : 'تم إضافة المستودع بنجاح' 
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ المستودع' });
      }
    });
  }
}
