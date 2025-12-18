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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, ToggleSwitch, Toast, ConfirmDialog, Toolbar
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>التصنيفات</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إضافة تصنيف" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="categories" [paginator]="true" [rows]="10" [loading]="loading"
               [globalFilterFields]="['code', 'name', 'nameEn']" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">الكود <p-sortIcon field="code"></p-sortIcon></th>
            <th pSortableColumn="name">الاسم <p-sortIcon field="name"></p-sortIcon></th>
            <th>الاسم (إنجليزي)</th>
            <th>التصنيف الأب</th>
            <th>عدد الأصناف</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
          <tr>
            <td>{{ category.code }}</td>
            <td>{{ category.name }}</td>
            <td>{{ category.nameEn || '-' }}</td>
            <td>{{ category.parent?.name || '-' }}</td>
            <td>{{ category._count?.items || 0 }}</td>
            <td>
              <span [class]="'status-badge ' + (category.isActive ? 'active' : 'inactive')">
                {{ category.isActive ? 'فعال' : 'غير فعال' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      (click)="editCategory(category)"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      (click)="deleteCategory(category)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">لا توجد تصنيفات</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="categoryDialog" [header]="editMode ? 'تعديل تصنيف' : 'إضافة تصنيف'" 
              [modal]="true" [style]="{width: '500px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field">
          <label for="code">الكود *</label>
          <input pInputText id="code" [(ngModel)]="category.code" required [disabled]="editMode" />
        </div>
        <div class="field">
          <label for="name">الاسم (عربي) *</label>
          <input pInputText id="name" [(ngModel)]="category.name" required />
        </div>
        <div class="field">
          <label for="nameEn">الاسم (إنجليزي)</label>
          <input pInputText id="nameEn" [(ngModel)]="category.nameEn" />
        </div>
        <div class="field">
          <label for="parent">التصنيف الأب</label>
          <p-select [options]="parentCategories" [(ngModel)]="category.parentId" 
                    optionLabel="name" optionValue="id" [showClear]="true"
                    placeholder="اختر التصنيف الأب"></p-select>
        </div>
        <div class="field">
          <label for="description">الوصف</label>
          <input pInputText id="description" [(ngModel)]="category.description" />
        </div>
        <div class="field-checkbox">
          <p-toggleswitch [(ngModel)]="category.isActive"></p-toggleswitch>
          <label>فعال</label>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveCategory()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container { padding: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .field-checkbox { display: flex; align-items: center; gap: 0.5rem; }
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
    }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    .text-center { text-align: center; padding: 2rem; color: #64748b; }
    h2 { margin: 0; color: #1e3a5f; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  parentCategories: any[] = [];
  category: any = {};
  categoryDialog = false;
  editMode = false;
  loading = false;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.api.getCategories({ take: 100 }).subscribe({
      next: (res) => {
        this.categories = res.data;
        this.parentCategories = res.data.filter(c => !c.parentId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل التصنيفات' });
      }
    });
  }

  openNew() {
    this.category = { isActive: true };
    this.editMode = false;
    this.categoryDialog = true;
  }

  editCategory(category: any) {
    this.category = { ...category };
    this.editMode = true;
    this.categoryDialog = true;
  }

  deleteCategory(category: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف التصنيف "${category.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.deleteCategory(category.id).subscribe({
          next: () => {
            this.loadCategories();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف التصنيف' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حذف التصنيف' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.categoryDialog = false;
  }

  saveCategory() {
    if (!this.category.code || !this.category.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    const payload = { ...this.category };
    delete payload.id;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.parent;
    delete payload.children;
    delete payload._count;

    const action = this.editMode
      ? this.api.updateCategory(this.category.id, payload)
      : this.api.createCategory(payload);

    action.subscribe({
      next: () => {
        this.loadCategories();
        this.hideDialog();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editMode ? 'تم تحديث التصنيف' : 'تم إضافة التصنيف' 
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ التصنيف' });
      }
    });
  }
}
