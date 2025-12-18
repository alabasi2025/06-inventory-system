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
  selector: 'app-suppliers',
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
          <h2>الموردين</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إضافة مورد" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="suppliers" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">الكود</th>
            <th pSortableColumn="name">الاسم</th>
            <th>النوع</th>
            <th>التصنيف</th>
            <th>الهاتف</th>
            <th>البريد</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-supplier>
          <tr>
            <td>{{ supplier.code }}</td>
            <td>{{ supplier.name }}</td>
            <td>
              <p-tag [value]="getTypeLabel(supplier.type)" [severity]="getTypeSeverity(supplier.type)"></p-tag>
            </td>
            <td>
              <p-tag [value]="supplier.category" [severity]="getCategorySeverity(supplier.category)"></p-tag>
            </td>
            <td>{{ supplier.phone || '-' }}</td>
            <td>{{ supplier.email || '-' }}</td>
            <td>
              <span [class]="'status-badge ' + (supplier.isActive ? 'active' : 'inactive')">
                {{ supplier.isActive ? 'فعال' : 'غير فعال' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      (click)="editSupplier(supplier)"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      (click)="deleteSupplier(supplier)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="8" class="text-center">لا يوجد موردين</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="supplierDialog" [header]="editMode ? 'تعديل مورد' : 'إضافة مورد'" 
              [modal]="true" [style]="{width: '600px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="grid">
          <div class="col-6">
            <div class="field">
              <label for="code">الكود *</label>
              <input pInputText id="code" [(ngModel)]="supplier.code" required [disabled]="editMode" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="taxNumber">الرقم الضريبي</label>
              <input pInputText id="taxNumber" [(ngModel)]="supplier.taxNumber" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="name">الاسم (عربي) *</label>
              <input pInputText id="name" [(ngModel)]="supplier.name" required />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="nameEn">الاسم (إنجليزي)</label>
              <input pInputText id="nameEn" [(ngModel)]="supplier.nameEn" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="type">النوع</label>
              <p-select [options]="supplierTypes" [(ngModel)]="supplier.type" 
                        optionLabel="label" optionValue="value"></p-select>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="category">التصنيف</label>
              <p-select [options]="supplierCategories" [(ngModel)]="supplier.category" 
                        optionLabel="label" optionValue="value"></p-select>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="phone">الهاتف</label>
              <input pInputText id="phone" [(ngModel)]="supplier.phone" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="email">البريد الإلكتروني</label>
              <input pInputText id="email" [(ngModel)]="supplier.email" type="email" />
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label for="address">العنوان</label>
              <input pInputText id="address" [(ngModel)]="supplier.address" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="contactPerson">جهة الاتصال</label>
              <input pInputText id="contactPerson" [(ngModel)]="supplier.contactPerson" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="contactPhone">هاتف جهة الاتصال</label>
              <input pInputText id="contactPhone" [(ngModel)]="supplier.contactPhone" />
            </div>
          </div>
          <div class="col-12">
            <div class="field-checkbox">
              <p-toggleswitch [(ngModel)]="supplier.isActive"></p-toggleswitch>
              <label>فعال</label>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveSupplier()"></button>
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
    .grid { display: flex; flex-wrap: wrap; margin: -0.5rem; }
    .col-6 { width: 50%; padding: 0.5rem; box-sizing: border-box; }
    .col-12 { width: 100%; padding: 0.5rem; box-sizing: border-box; }
  `]
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  supplier: any = {};
  supplierDialog = false;
  editMode = false;
  loading = false;

  supplierTypes = [
    { label: 'محلي', value: 'local' },
    { label: 'دولي', value: 'international' }
  ];

  supplierCategories = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' }
  ];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.loading = true;
    this.api.getSuppliers({ take: 100 }).subscribe({
      next: (res) => {
        this.suppliers = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الموردين' });
      }
    });
  }

  getTypeLabel(type: string): string {
    const labels: any = { local: 'محلي', international: 'دولي' };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { local: 'success', international: 'info' };
    return severities[type] || 'info';
  }

  getCategorySeverity(category: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { A: 'success', B: 'info', C: 'warn' };
    return severities[category] || 'info';
  }

  openNew() {
    this.supplier = { type: 'local', category: 'B', isActive: true };
    this.editMode = false;
    this.supplierDialog = true;
  }

  editSupplier(supplier: any) {
    this.supplier = { ...supplier };
    this.editMode = true;
    this.supplierDialog = true;
  }

  deleteSupplier(supplier: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف المورد "${supplier.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.loadSuppliers();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف المورد' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حذف المورد' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.supplierDialog = false;
  }

  saveSupplier() {
    if (!this.supplier.code || !this.supplier.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    const action = this.editMode
      ? this.api.updateSupplier(this.supplier.id, this.supplier)
      : this.api.createSupplier(this.supplier);

    action.subscribe({
      next: () => {
        this.loadSuppliers();
        this.hideDialog();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editMode ? 'تم تحديث المورد' : 'تم إضافة المورد' 
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ المورد' });
      }
    });
  }
}
