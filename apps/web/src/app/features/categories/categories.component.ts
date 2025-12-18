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
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, ToggleSwitch, Toast, ConfirmDialog, Tag,
    InputIcon, IconField
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6)">
            <i class="pi pi-tags"></i>
          </div>
          <div class="header-text">
            <h1>التصنيفات</h1>
            <p>إدارة تصنيفات الأصناف والمنتجات</p>
          </div>
        </div>
        <button pButton label="إضافة تصنيف" icon="pi pi-plus" 
                class="p-button-primary" (click)="openNew()"></button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input pInputText type="text" [(ngModel)]="searchTerm" 
                 (input)="onSearch($event)" placeholder="بحث في التصنيفات..." 
                 class="search-input" />
        </p-iconfield>
        <div class="filter-info">
          <span class="total-count">{{ categories.length }} تصنيف</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <p-table [value]="filteredCategories" [paginator]="true" [rows]="10" 
                 [loading]="loading" [rowHover]="true"
                 [showCurrentPageReport]="true" 
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords}"
                 styleClass="p-datatable-sm modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 100px">الكود</th>
              <th style="width: 200px">الاسم</th>
              <th style="width: 150px">الاسم (إنجليزي)</th>
              <th style="width: 150px">التصنيف الأب</th>
              <th style="width: 80px" class="text-center">الأصناف</th>
              <th style="width: 80px" class="text-center">الحالة</th>
              <th style="width: 90px" class="text-center">إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-category>
            <tr>
              <td><span class="code-badge">{{ category.code }}</span></td>
              <td>
                <div class="name-cell">
                  <span class="name-primary">{{ category.name }}</span>
                  <span class="name-desc" *ngIf="category.description">{{ category.description }}</span>
                </div>
              </td>
              <td>{{ category.nameEn || '-' }}</td>
              <td>
                <span *ngIf="category.parent" class="parent-badge">
                  <i class="pi pi-folder"></i>
                  {{ category.parent.name }}
                </span>
                <span *ngIf="!category.parent" class="no-parent">-</span>
              </td>
              <td class="text-center">
                <span class="count-badge">{{ category._count?.items || 0 }}</span>
              </td>
              <td class="text-center">
                <p-tag [severity]="category.isActive ? 'success' : 'danger'" 
                       [value]="category.isActive ? 'فعال' : 'معطل'"
                       [rounded]="true" styleClass="text-xs"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-sm"
                          (click)="editCategory(category)"></button>
                  <button pButton icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger p-button-sm"
                          (click)="deleteCategory(category)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-state">
                <div class="empty-content">
                  <i class="pi pi-inbox"></i>
                  <h4>لا توجد تصنيفات</h4>
                  <p>ابدأ بإضافة تصنيف جديد</p>
                  <button pButton label="إضافة تصنيف" icon="pi pi-plus" 
                          class="p-button-outlined" (click)="openNew()"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="categoryDialog" [header]="editMode ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'" 
              [modal]="true" [style]="{width: '500px'}" styleClass="modern-dialog">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <div class="form-field">
            <label for="code">الكود <span class="required">*</span></label>
            <input pInputText id="code" [(ngModel)]="category.code" 
                   [disabled]="editMode" placeholder="مثال: CAT-001" />
            <small class="field-hint" *ngIf="!editMode">الكود فريد ولا يمكن تغييره</small>
          </div>
          
          <div class="form-field">
            <label for="name">الاسم (عربي) <span class="required">*</span></label>
            <input pInputText id="name" [(ngModel)]="category.name" 
                   placeholder="اسم التصنيف" />
          </div>
          
          <div class="form-field">
            <label for="nameEn">الاسم (إنجليزي)</label>
            <input pInputText id="nameEn" [(ngModel)]="category.nameEn" 
                   placeholder="Category name" dir="ltr" />
          </div>
          
          <div class="form-field">
            <label for="parent">التصنيف الأب</label>
            <p-select [options]="parentCategories" [(ngModel)]="category.parentId" 
                      optionLabel="name" optionValue="id" [showClear]="true"
                      placeholder="اختر التصنيف الأب"
                      styleClass="w-full"></p-select>
          </div>
          
          <div class="form-field full-width">
            <label for="description">الوصف</label>
            <input pInputText id="description" [(ngModel)]="category.description" 
                   placeholder="وصف مختصر للتصنيف" />
          </div>
          
          <div class="form-field-switch">
            <p-toggleswitch [(ngModel)]="category.isActive"></p-toggleswitch>
            <label>التصنيف فعال</label>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="إلغاء" icon="pi pi-times" 
                  class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="حفظ" icon="pi pi-check" 
                  class="p-button-primary" (click)="saveCategory()"
                  [loading]="saving"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [PAGE_STYLES]
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  filteredCategories: any[] = [];
  parentCategories: any[] = [];
  category: any = {};
  categoryDialog = false;
  editMode = false;
  loading = false;
  saving = false;
  searchTerm = '';

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
        this.filteredCategories = [...this.categories];
        this.parentCategories = this.categories.filter(c => !c.parentId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل التصنيفات' });
      }
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredCategories = this.categories.filter(c => 
      c.code.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term) ||
      (c.nameEn && c.nameEn.toLowerCase().includes(term))
    );
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
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteCategory(category.id).subscribe({
          next: () => {
            this.loadCategories();
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف التصنيف بنجاح' });
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

    this.saving = true;
    const action = this.editMode
      ? this.api.updateCategory(this.category.id, this.category)
      : this.api.createCategory(this.category);

    action.subscribe({
      next: () => {
        this.loadCategories();
        this.hideDialog();
        this.saving = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'تم', 
          detail: this.editMode ? 'تم تحديث التصنيف بنجاح' : 'تم إضافة التصنيف بنجاح' 
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ التصنيف' });
      }
    });
  }
}
