import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitsService, Unit } from '../../core/services/units.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    CheckboxModule, ToastModule, ConfirmDialogModule,
    TagModule, CardModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">وحدات القياس</h1>
        <button pButton label="إضافة وحدة" icon="pi pi-plus" 
                (click)="openNew()" class="p-button-primary"></button>
      </div>
      
      <!-- Loading State -->
      @if (loading) {
        <p-card>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="25%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="20%" height="2rem"></p-skeleton>
              </div>
            }
          </div>
        </p-card>
      }
      
      <!-- Error State -->
      @if (error && !loading) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i class="pi pi-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <p class="text-red-700 mb-4">{{ error }}</p>
          <button pButton label="إعادة المحاولة" icon="pi pi-refresh" 
                  class="p-button-outlined p-button-danger" (click)="loadUnits()"></button>
        </div>
      }
      
      <!-- Data Table -->
      @if (!loading && !error) {
        <p-card>
          <p-table [value]="units" [paginator]="true" [rows]="10"
                   [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                   currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} وحدة"
                   styleClass="p-datatable-sm p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="code">الكود <p-sortIcon field="code"></p-sortIcon></th>
                <th pSortableColumn="name">الاسم <p-sortIcon field="name"></p-sortIcon></th>
                <th>الرمز</th>
                <th pSortableColumn="is_active">الحالة <p-sortIcon field="is_active"></p-sortIcon></th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-unit>
              <tr>
                <td class="font-medium">{{ unit.code }}</td>
                <td>{{ unit.name }}</td>
                <td class="text-gray-500">{{ unit.symbol }}</td>
                <td>
                  <p-tag [value]="unit.is_active ? 'نشط' : 'غير نشط'" 
                         [severity]="unit.is_active ? 'success' : 'danger'"></p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info"
                            (click)="editUnit(unit)" pTooltip="تعديل"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            (click)="confirmDelete(unit)" pTooltip="حذف"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center py-8">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">لا توجد وحدات قياس</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }
      
      <!-- Form Dialog -->
      <p-dialog [(visible)]="showForm" [modal]="true" [style]="{width: '450px'}"
                [header]="editingUnit ? 'تعديل وحدة قياس' : 'إضافة وحدة قياس'" [closable]="true">
        <div class="space-y-4 pt-4">
          <div class="flex flex-col gap-2">
            <label class="font-medium">الكود <span class="text-red-500">*</span></label>
            <input pInputText [(ngModel)]="formData.code" class="w-full" />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">الاسم بالعربية <span class="text-red-500">*</span></label>
            <input pInputText [(ngModel)]="formData.name" class="w-full" />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">الاسم بالإنجليزية</label>
            <input pInputText [(ngModel)]="formData.name_en" class="w-full" />
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">الرمز <span class="text-red-500">*</span></label>
            <input pInputText [(ngModel)]="formData.symbol" class="w-full" />
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
            <button pButton [label]="editingUnit ? 'تحديث' : 'حفظ'" icon="pi pi-check" 
                    (click)="saveUnit()" [loading]="saving"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class UnitsListComponent implements OnInit {
  private unitsService = inject(UnitsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  units: Unit[] = [];
  showForm = false;
  loading = true;
  saving = false;
  error: string | null = null;
  editingUnit: Unit | null = null;
  formData: Partial<Unit> = this.getEmptyForm();

  ngOnInit() {
    this.loadUnits();
  }

  getEmptyForm(): Partial<Unit> {
    return {
      code: '',
      name: '',
      name_en: '',
      symbol: '',
      is_active: true
    };
  }

  loadUnits() {
    this.loading = true;
    this.error = null;
    
    this.unitsService.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.units = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل وحدات القياس';
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: this.error || 'خطأ غير معروف'
        });
      }
    });
  }

  openNew() {
    this.editingUnit = null;
    this.formData = this.getEmptyForm();
    this.showForm = true;
  }

  editUnit(unit: Unit) {
    this.editingUnit = unit;
    this.formData = { ...unit };
    this.showForm = true;
  }

  saveUnit() {
    if (!this.formData.code || !this.formData.name || !this.formData.symbol) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى ملء الحقول المطلوبة'
      });
      return;
    }
    
    this.saving = true;
    
    const request = this.editingUnit
      ? this.unitsService.update(this.editingUnit.id, this.formData)
      : this.unitsService.create(this.formData);
    
    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: this.editingUnit ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح'
        });
        this.showForm = false;
        this.saving = false;
        this.loadUnits();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err.error?.message || 'حدث خطأ أثناء حفظ الوحدة'
        });
      }
    });
  }

  confirmDelete(unit: Unit) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الوحدة "${unit.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.unitsService.delete(unit.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم حذف الوحدة بنجاح'
            });
            this.loadUnits();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err.error?.message || 'حدث خطأ أثناء حذف الوحدة'
            });
          }
        });
      }
    });
  }
}
