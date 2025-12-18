import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from '../../core/services/categories.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    Select, Textarea, CheckboxModule,
    ToastModule, ConfirmDialogModule, ProgressSpinnerModule,
    TagModule, CardModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">التصنيفات</h1>
        <button pButton label="إضافة تصنيف" icon="pi pi-plus" 
                (click)="openNew()" class="p-button-primary"></button>
      </div>
      
      <!-- Loading State -->
      @if (loading) {
        <p-card>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <p-skeleton width="10%" height="2rem"></p-skeleton>
                <p-skeleton width="30%" height="2rem"></p-skeleton>
                <p-skeleton width="20%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
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
                  class="p-button-outlined p-button-danger" (click)="loadCategories()"></button>
        </div>
      }
      
      <!-- Data Table -->
      @if (!loading && !error) {
        <p-card>
          <p-table [value]="categories" [paginator]="true" [rows]="10" 
                   [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                   currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} تصنيف"
                   [globalFilterFields]="['code', 'name', 'name_en']"
                   styleClass="p-datatable-sm p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="code">الكود <p-sortIcon field="code"></p-sortIcon></th>
                <th pSortableColumn="name">الاسم <p-sortIcon field="name"></p-sortIcon></th>
                <th>التصنيف الأب</th>
                <th pSortableColumn="is_active">الحالة <p-sortIcon field="is_active"></p-sortIcon></th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-category>
              <tr>
                <td class="font-medium">{{ category.code }}</td>
                <td>{{ category.name }}</td>
                <td class="text-gray-500">{{ getParentName(category.parent_id) }}</td>
                <td>
                  <p-tag [value]="category.is_active ? 'نشط' : 'غير نشط'" 
                         [severity]="category.is_active ? 'success' : 'danger'"></p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info"
                            (click)="editCategory(category)" pTooltip="تعديل"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            (click)="confirmDelete(category)" pTooltip="حذف"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center py-8">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">لا توجد تصنيفات</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }
      
      <!-- Form Dialog -->
      <p-dialog [(visible)]="showForm" [modal]="true" [style]="{width: '500px'}"
                [header]="editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف'" [closable]="true">
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
            <label class="font-medium">التصنيف الأب</label>
            <p-select [options]="parentOptions" [(ngModel)]="formData.parent_id"
                        optionLabel="label" optionValue="value" [showClear]="true"
                        placeholder="-- بدون --" styleClass="w-full"></p-select>
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
            <button pButton [label]="editingCategory ? 'تحديث' : 'حفظ'" icon="pi pi-check" 
                    (click)="saveCategory()" [loading]="saving"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class CategoriesListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  categories: Category[] = [];
  parentOptions: {label: string, value: string | null}[] = [];
  showForm = false;
  loading = true;
  saving = false;
  error: string | null = null;
  editingCategory: Category | null = null;
  formData: Partial<Category> = this.getEmptyForm();

  ngOnInit() {
    this.loadCategories();
  }

  getEmptyForm(): Partial<Category> {
    return {
      code: '',
      name: '',
      name_en: '',
      parent_id: undefined,
      is_active: true
    };
  }

  loadCategories() {
    this.loading = true;
    this.error = null;
    
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.categories = res.data;
        this.parentOptions = [
          { label: '-- بدون --', value: null },
          ...this.categories.map(c => ({ label: c.name, value: c.id }))
        ];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل التصنيفات';
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
    this.editingCategory = null;
    this.formData = this.getEmptyForm();
    this.showForm = true;
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.formData = { ...category };
    this.showForm = true;
  }

  saveCategory() {
    if (!this.formData.code || !this.formData.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى ملء الحقول المطلوبة'
      });
      return;
    }
    
    this.saving = true;
    const data = { ...this.formData };
    if (!data.parent_id) delete data.parent_id;
    
    const request = this.editingCategory
      ? this.categoriesService.update(this.editingCategory.id, data)
      : this.categoriesService.create(data);
    
    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: this.editingCategory ? 'تم تحديث التصنيف بنجاح' : 'تم إضافة التصنيف بنجاح'
        });
        this.showForm = false;
        this.saving = false;
        this.loadCategories();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err.error?.message || 'حدث خطأ أثناء حفظ التصنيف'
        });
      }
    });
  }

  confirmDelete(category: Category) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف التصنيف "${category.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriesService.delete(category.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم حذف التصنيف بنجاح'
            });
            this.loadCategories();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err.error?.message || 'حدث خطأ أثناء حذف التصنيف'
            });
          }
        });
      }
    });
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '-';
    const parent = this.categories.find(c => c.id === parentId);
    return parent?.name || '-';
  }
}
