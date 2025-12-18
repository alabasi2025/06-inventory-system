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
import { Toolbar } from 'primeng/toolbar';
import { Tag } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, ToggleSwitch, Toast, ConfirmDialog, Toolbar, Tag
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>المستودعات</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إضافة مستودع" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="warehouses" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">الكود</th>
            <th pSortableColumn="name">الاسم</th>
            <th>النوع</th>
            <th>العنوان</th>
            <th>عدد الأصناف</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-warehouse>
          <tr>
            <td>{{ warehouse.code }}</td>
            <td>{{ warehouse.name }}</td>
            <td>
              <p-tag [value]="getTypeLabel(warehouse.type)" [severity]="getTypeSeverity(warehouse.type)"></p-tag>
            </td>
            <td>{{ warehouse.address || '-' }}</td>
            <td>{{ warehouse._count?.stocks || 0 }}</td>
            <td>
              <span [class]="'status-badge ' + (warehouse.isActive ? 'active' : 'inactive')">
                {{ warehouse.isActive ? 'فعال' : 'غير فعال' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      (click)="editWarehouse(warehouse)"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      (click)="deleteWarehouse(warehouse)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">لا توجد مستودعات</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="warehouseDialog" [header]="editMode ? 'تعديل مستودع' : 'إضافة مستودع'" 
              [modal]="true" [style]="{width: '500px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field">
          <label for="code">الكود *</label>
          <input pInputText id="code" [(ngModel)]="warehouse.code" required [disabled]="editMode" />
        </div>
        <div class="field">
          <label for="name">الاسم (عربي) *</label>
          <input pInputText id="name" [(ngModel)]="warehouse.name" required />
        </div>
        <div class="field">
          <label for="nameEn">الاسم (إنجليزي)</label>
          <input pInputText id="nameEn" [(ngModel)]="warehouse.nameEn" />
        </div>
        <div class="field">
          <label for="type">النوع</label>
          <p-select [options]="warehouseTypes" [(ngModel)]="warehouse.type" 
                    optionLabel="label" optionValue="value"></p-select>
        </div>
        <div class="field">
          <label for="address">العنوان</label>
          <input pInputText id="address" [(ngModel)]="warehouse.address" />
        </div>
        <div class="field">
          <label for="phone">الهاتف</label>
          <input pInputText id="phone" [(ngModel)]="warehouse.phone" />
        </div>
        <div class="field-checkbox">
          <p-toggleswitch [(ngModel)]="warehouse.isActive"></p-toggleswitch>
          <label>فعال</label>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveWarehouse()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container { padding: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .field-checkbox { display: flex; align-items: center; gap: 0.5rem; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    .text-center { text-align: center; padding: 2rem; color: #64748b; }
    h2 { margin: 0; color: #1e3a5f; }
  `]
})
export class WarehousesComponent implements OnInit {
  warehouses: any[] = [];
  warehouse: any = {};
  warehouseDialog = false;
  editMode = false;
  loading = false;

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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل المستودعات' });
      }
    });
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
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.deleteWarehouse(warehouse.id).subscribe({
          next: () => {
            this.loadWarehouses();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المستودع' });
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

    const action = this.editMode
      ? this.api.updateWarehouse(this.warehouse.id, this.warehouse)
      : this.api.createWarehouse(this.warehouse);

    action.subscribe({
      next: () => {
        this.loadWarehouses();
        this.hideDialog();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editMode ? 'تم تحديث المستودع' : 'تم إضافة المستودع' 
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ المستودع' });
      }
    });
  }
}
