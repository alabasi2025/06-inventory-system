import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService, Supplier } from '../../core/services/suppliers.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    Textarea, Select, CheckboxModule, ToastModule, ConfirmDialogModule,
    TagModule, CardModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">الموردين</h1>
        <button pButton label="إضافة مورد" icon="pi pi-plus" 
                (click)="openNew()" class="p-button-primary"></button>
      </div>
      
      @if (loading) {
        <p-card>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <p-skeleton width="10%" height="2rem"></p-skeleton>
                <p-skeleton width="20%" height="2rem"></p-skeleton>
                <p-skeleton width="12%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
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
          <p-table [value]="suppliers" [paginator]="true" [rows]="10"
                   [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                   currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} مورد"
                   styleClass="p-datatable-sm p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="code">الكود</th>
                <th pSortableColumn="name">الاسم</th>
                <th>النوع</th>
                <th>جهة الاتصال</th>
                <th>الهاتف</th>
                <th>التقييم</th>
                <th pSortableColumn="is_active">الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-s>
              <tr>
                <td class="font-medium">{{ s.code }}</td>
                <td>{{ s.name }}</td>
                <td>{{ s.type === 'local' ? 'محلي' : 'دولي' }}</td>
                <td class="text-gray-500">{{ s.contact_person || '-' }}</td>
                <td class="text-gray-500">{{ s.phone || '-' }}</td>
                <td>
                  @if (s.rating) {
                    <span class="text-yellow-500">★</span> {{ s.rating }}/5
                  } @else { - }
                </td>
                <td>
                  <p-tag [value]="s.is_active ? 'نشط' : 'غير نشط'" 
                         [severity]="s.is_active ? 'success' : 'danger'"></p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info"
                            (click)="edit(s)"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            (click)="confirmDelete(s)"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-8">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">لا يوجد موردين</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }
      
      <p-dialog [(visible)]="showForm" [modal]="true" [style]="{width: '650px'}"
                [header]="editing ? 'تعديل مورد' : 'إضافة مورد'" [closable]="true">
        <div class="space-y-4 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الكود <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="formData.code" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">النوع</label>
              <p-select [options]="supplierTypes" [(ngModel)]="formData.type"
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
          
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الرقم الضريبي</label>
              <input pInputText [(ngModel)]="formData.tax_number" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">السجل التجاري</label>
              <input pInputText [(ngModel)]="formData.commercial_reg" class="w-full" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">جهة الاتصال</label>
              <input pInputText [(ngModel)]="formData.contact_person" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">الهاتف</label>
              <input pInputText [(ngModel)]="formData.phone" class="w-full" />
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">البريد الإلكتروني</label>
              <input pInputText [(ngModel)]="formData.email" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">المدينة</label>
              <input pInputText [(ngModel)]="formData.city" class="w-full" />
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">العنوان</label>
            <textarea pTextarea [(ngModel)]="formData.address" rows="2" class="w-full"></textarea>
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
export class SuppliersListComponent implements OnInit {
  private service = inject(SuppliersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  suppliers: Supplier[] = [];
  showForm = false;
  loading = true;
  saving = false;
  error: string | null = null;
  editing: Supplier | null = null;
  formData: Partial<Supplier> = this.getEmptyForm();
  
  supplierTypes = [
    { label: 'محلي', value: 'local' },
    { label: 'دولي', value: 'international' }
  ];

  ngOnInit() { this.load(); }

  getEmptyForm(): Partial<Supplier> {
    return { code: '', name: '', name_en: '', type: 'local', tax_number: '', commercial_reg: '', 
             contact_person: '', phone: '', email: '', address: '', city: '', is_active: true };
  }

  load() {
    this.loading = true;
    this.error = null;
    this.service.getAll({ limit: 100 }).subscribe({
      next: (res) => { this.suppliers = res.data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل الموردين';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: this.error || 'خطأ' });
      }
    });
  }

  openNew() { this.editing = null; this.formData = this.getEmptyForm(); this.showForm = true; }

  edit(s: Supplier) { this.editing = s; this.formData = { ...s }; this.showForm = true; }

  save() {
    if (!this.formData.code || !this.formData.name) {
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

  confirmDelete(s: Supplier) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف "${s.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(s.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم الحذف' }); this.load(); },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'خطأ' })
        });
      }
    });
  }
}
