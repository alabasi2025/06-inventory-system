import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehousesService, Warehouse } from '../../core/services/warehouses.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    Select, CheckboxModule, ToastModule, ConfirmDialogModule,
    TagModule, CardModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">المستودعات</h1>
        <button pButton label="إضافة مستودع" icon="pi pi-plus" 
                (click)="openNew()" class="p-button-primary"></button>
      </div>
      
      @if (loading) {
        <p-card>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <p-skeleton width="10%" height="2rem"></p-skeleton>
                <p-skeleton width="25%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="20%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
              </div>
            }
          </div>
        </p-card>
      }
      
      @if (error && !loading) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i class="pi pi-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button pButton label="إعادة المحاولة" icon="pi pi-refresh" 
                  class="p-button-outlined p-button-danger" (click)="load()"></button>
        </div>
      }
      
      @if (!loading && !error) {
        <p-card>
          <p-table [value]="warehouses" [paginator]="true" [rows]="10"
                   [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                   currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} مستودع"
                   styleClass="p-datatable-sm p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="code">الكود</th>
                <th pSortableColumn="name">الاسم</th>
                <th>النوع</th>
                <th>الموقع</th>
                <th>المسؤول</th>
                <th pSortableColumn="is_active">الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-w>
              <tr>
                <td class="font-medium">{{ w.code }}</td>
                <td>{{ w.name }}</td>
                <td>{{ getTypeName(w.type) }}</td>
                <td class="text-gray-500">{{ w.location || '-' }}</td>
                <td class="text-gray-500">{{ w.manager_name || '-' }}</td>
                <td>
                  <p-tag [value]="w.is_active ? 'نشط' : 'غير نشط'" 
                         [severity]="w.is_active ? 'success' : 'danger'"></p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info"
                            (click)="edit(w)"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            (click)="confirmDelete(w)"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center py-8">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">لا توجد مستودعات</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }
      
      <p-dialog [(visible)]="showForm" [modal]="true" [style]="{width: '600px'}"
                [header]="editing ? 'تعديل مستودع' : 'إضافة مستودع'" [closable]="true">
        <div class="space-y-4 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الكود <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="formData.code" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">النوع <span class="text-red-500">*</span></label>
              <p-select [options]="warehouseTypes" [(ngModel)]="formData.type"
                          optionLabel="label" optionValue="value" styleClass="w-full"></p-select>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الاسم بالعربية <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="formData.name" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">الاسم بالإنجليزية</label>
              <input pInputText [(ngModel)]="formData.name_en" class="w-full" />
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">الموقع</label>
            <input pInputText [(ngModel)]="formData.location" class="w-full" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">اسم المسؤول</label>
              <input pInputText [(ngModel)]="formData.manager_name" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">الهاتف</label>
              <input pInputText [(ngModel)]="formData.phone" class="w-full" />
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <p-checkbox [(ngModel)]="formData.is_active" [binary]="true" inputId="is_active"></p-checkbox>
            <label for="is_active">نشط</label>
          </div>
        </div>
        
        <ng-template pTemplate="footer">
          <div class="flex gap-2 justify-end">
            <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" 
                    (click)="showForm = false" [disabled]="saving"></button>
            <button pButton [label]="editing ? 'تحديث' : 'حفظ'" icon="pi pi-check" 
                    (click)="save()" [loading]="saving"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class WarehousesListComponent implements OnInit {
  private service = inject(WarehousesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  warehouses: Warehouse[] = [];
  showForm = false;
  loading = true;
  saving = false;
  error: string | null = null;
  editing: Warehouse | null = null;
  formData: Partial<Warehouse> = this.getEmptyForm();
  
  warehouseTypes = [
    { label: 'رئيسي', value: 'main' },
    { label: 'فرعي', value: 'sub' },
    { label: 'عبور', value: 'transit' }
  ];

  ngOnInit() { this.load(); }

  getEmptyForm(): Partial<Warehouse> {
    return { code: '', name: '', name_en: '', type: 'main', location: '', manager_name: '', phone: '', is_active: true };
  }

  load() {
    this.loading = true;
    this.error = null;
    this.service.getAll({ limit: 100 }).subscribe({
      next: (res) => { this.warehouses = res.data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل المستودعات';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: this.error || 'خطأ' });
      }
    });
  }

  openNew() { this.editing = null; this.formData = this.getEmptyForm(); this.showForm = true; }

  edit(w: Warehouse) { this.editing = w; this.formData = { ...w }; this.showForm = true; }

  save() {
    if (!this.formData.code || !this.formData.name || !this.formData.type) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }
    this.saving = true;
    const req = this.editing ? this.service.update(this.editing.id, this.formData) : this.service.create(this.formData);
    req.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editing ? 'تم التحديث' : 'تم الإضافة' });
        this.showForm = false; this.saving = false; this.load();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'حدث خطأ' });
      }
    });
  }

  confirmDelete(w: Warehouse) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف "${w.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(w.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم الحذف' }); this.load(); },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'خطأ' })
        });
      }
    });
  }

  getTypeName(type: string): string { return { main: 'رئيسي', sub: 'فرعي', transit: 'عبور' }[type] || type; }
}
