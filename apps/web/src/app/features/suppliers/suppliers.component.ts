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
  selector: 'app-suppliers',
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
          <div class="header-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb)">
            <i class="pi pi-users"></i>
          </div>
          <div class="header-text">
            <h1>الموردين</h1>
            <p>إدارة بيانات الموردين والمزودين</p>
          </div>
        </div>
        <button pButton label="إضافة مورد" icon="pi pi-plus" 
                class="p-button-primary" (click)="openNew()"></button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input pInputText type="text" [(ngModel)]="searchTerm" 
                 (input)="onSearch($event)" placeholder="بحث في الموردين..." 
                 class="search-input" />
        </p-iconfield>
        <div class="filter-info">
          <span class="total-count">{{ suppliers.length }} مورد</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <p-table [value]="filteredSuppliers" [paginator]="true" [rows]="10" 
                 [loading]="loading" [rowHover]="true"
                 [showCurrentPageReport]="true" currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords}"
                 styleClass="p-datatable-striped modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="code" style="width: 100px">
                الكود <p-sortIcon field="code"></p-sortIcon>
              </th>
              <th pSortableColumn="name">
                الاسم <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th style="width: 90px" class="text-center">النوع</th>
              <th style="width: 80px" class="text-center">التصنيف</th>
              <th style="width: 130px">الهاتف</th>
              <th style="width: 180px">البريد</th>
              <th style="width: 100px" class="text-center">الحالة</th>
              <th style="width: 120px" class="text-center">الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-supplier>
            <tr>
              <td><span class="code-badge">{{ supplier.code }}</span></td>
              <td>
                <div class="supplier-info">
                  <span class="name-primary">{{ supplier.name }}</span>
                  <span class="contact-person" *ngIf="supplier.contactPerson">
                    <i class="pi pi-user"></i> {{ supplier.contactPerson }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <p-tag [value]="getTypeLabel(supplier.type)" 
                       [severity]="getTypeSeverity(supplier.type)"
                       [rounded]="true"></p-tag>
              </td>
              <td class="text-center">
                <span class="category-badge" [attr.data-category]="supplier.category">
                  {{ supplier.category }}
                </span>
              </td>
              <td>
                <span *ngIf="supplier.phone" class="phone-link">
                  <i class="pi pi-phone"></i>
                  {{ supplier.phone }}
                </span>
                <span *ngIf="!supplier.phone" class="no-data">-</span>
              </td>
              <td>
                <span *ngIf="supplier.email" class="email-link">
                  <i class="pi pi-envelope"></i>
                  {{ supplier.email }}
                </span>
                <span *ngIf="!supplier.email" class="no-data">-</span>
              </td>
              <td class="text-center">
                <p-tag [severity]="supplier.isActive ? 'success' : 'danger'" 
                       [value]="supplier.isActive ? 'فعال' : 'غير فعال'"
                       [rounded]="true"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-sm"
                          pTooltip="تعديل" tooltipPosition="top"
                          (click)="editSupplier(supplier)"></button>
                  <button pButton icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger p-button-sm"
                          pTooltip="حذف" tooltipPosition="top"
                          (click)="deleteSupplier(supplier)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-state">
                <div class="empty-content">
                  <i class="pi pi-users"></i>
                  <h4>لا يوجد موردين</h4>
                  <p>ابدأ بإضافة مورد جديد</p>
                  <button pButton label="إضافة مورد" icon="pi pi-plus" 
                          class="p-button-outlined" (click)="openNew()"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="supplierDialog" [header]="editMode ? 'تعديل مورد' : 'إضافة مورد جديد'" 
              [modal]="true" [style]="{width: '650px'}" styleClass="modern-dialog">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <div class="form-field">
            <label for="code">الكود <span class="required">*</span></label>
            <input pInputText id="code" [(ngModel)]="supplier.code" 
                   [disabled]="editMode" placeholder="مثال: SUP-001" />
          </div>
          
          <div class="form-field">
            <label for="taxNumber">الرقم الضريبي</label>
            <input pInputText id="taxNumber" [(ngModel)]="supplier.taxNumber" 
                   placeholder="الرقم الضريبي" dir="ltr" />
          </div>
          
          <div class="form-field">
            <label for="name">الاسم (عربي) <span class="required">*</span></label>
            <input pInputText id="name" [(ngModel)]="supplier.name" 
                   placeholder="اسم المورد بالعربية" />
          </div>
          
          <div class="form-field">
            <label for="nameEn">الاسم (إنجليزي)</label>
            <input pInputText id="nameEn" [(ngModel)]="supplier.nameEn" 
                   placeholder="Supplier name in English" dir="ltr" />
          </div>
          
          <div class="form-field">
            <label for="type">النوع</label>
            <p-select [options]="supplierTypes" [(ngModel)]="supplier.type" 
                      optionLabel="label" optionValue="value"
                      styleClass="w-full"></p-select>
          </div>
          
          <div class="form-field">
            <label for="category">التصنيف</label>
            <p-select [options]="supplierCategories" [(ngModel)]="supplier.category" 
                      optionLabel="label" optionValue="value"
                      styleClass="w-full"></p-select>
          </div>
          
          <div class="form-field">
            <label for="phone">الهاتف</label>
            <input pInputText id="phone" [(ngModel)]="supplier.phone" 
                   placeholder="رقم الهاتف" dir="ltr" />
          </div>
          
          <div class="form-field">
            <label for="email">البريد الإلكتروني</label>
            <input pInputText id="email" [(ngModel)]="supplier.email" type="email" 
                   placeholder="email@example.com" dir="ltr" />
          </div>
          
          <div class="form-field full-width">
            <label for="address">العنوان</label>
            <input pInputText id="address" [(ngModel)]="supplier.address" 
                   placeholder="عنوان المورد" />
          </div>
          
          <div class="form-field">
            <label for="contactPerson">جهة الاتصال</label>
            <input pInputText id="contactPerson" [(ngModel)]="supplier.contactPerson" 
                   placeholder="اسم جهة الاتصال" />
          </div>
          
          <div class="form-field">
            <label for="contactPhone">هاتف جهة الاتصال</label>
            <input pInputText id="contactPhone" [(ngModel)]="supplier.contactPhone" 
                   placeholder="رقم الهاتف" dir="ltr" />
          </div>
          
          <div class="form-field-switch">
            <p-toggleswitch [(ngModel)]="supplier.isActive"></p-toggleswitch>
            <label>المورد فعال</label>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="إلغاء" icon="pi pi-times" 
                  class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="حفظ" icon="pi pi-check" 
                  class="p-button-primary" (click)="saveSupplier()"
                  [loading]="saving"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [PAGE_STYLES + `
    .supplier-info {
      display: flex;
      flex-direction: column;
    }

    .name-primary {
      font-weight: 500;
      color: #1e293b;
    }

    .contact-person {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .contact-person i {
      font-size: 0.625rem;
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.8125rem;
    }

    .category-badge[data-category="A"] {
      background: #dcfce7;
      color: #166534;
    }

    .category-badge[data-category="B"] {
      background: #dbeafe;
      color: #1e40af;
    }

    .category-badge[data-category="C"] {
      background: #fef3c7;
      color: #92400e;
    }

    .phone-link, .email-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: #475569;
      font-size: 0.875rem;
    }

    .phone-link i, .email-link i {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .no-data {
      color: #cbd5e1;
    }
  `]
})
export class SuppliersComponent implements OnInit {
  suppliers: any[] = [];
  filteredSuppliers: any[] = [];
  supplier: any = {};
  supplierDialog = false;
  editMode = false;
  loading = false;
  saving = false;
  searchTerm = '';

  supplierTypes = [
    { label: 'محلي', value: 'local' },
    { label: 'دولي', value: 'international' }
  ];

  supplierCategories = [
    { label: 'فئة A - ممتاز', value: 'A' },
    { label: 'فئة B - جيد', value: 'B' },
    { label: 'فئة C - عادي', value: 'C' }
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
        this.filteredSuppliers = [...this.suppliers];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الموردين' });
      }
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter(s => 
      s.code.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      (s.nameEn && s.nameEn.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  }

  getTypeLabel(type: string): string {
    const labels: any = { local: 'محلي', international: 'دولي' };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { local: 'success', international: 'info' };
    return severities[type] || 'info';
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
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteSupplier(supplier.id).subscribe({
          next: () => {
            this.loadSuppliers();
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المورد بنجاح' });
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

    this.saving = true;
    const action = this.editMode
      ? this.api.updateSupplier(this.supplier.id, this.supplier)
      : this.api.createSupplier(this.supplier);

    action.subscribe({
      next: () => {
        this.loadSuppliers();
        this.hideDialog();
        this.saving = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'تم', 
          detail: this.editMode ? 'تم تحديث المورد بنجاح' : 'تم إضافة المورد بنجاح' 
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ المورد' });
      }
    });
  }
}
