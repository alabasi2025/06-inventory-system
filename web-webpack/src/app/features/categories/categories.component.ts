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
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, ToggleSwitch, Toast, ConfirmDialog, Toolbar, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog [style]="{width: '450px'}"></p-confirmdialog>
    
    <div class="page-container">
      <div class="card">
        <p-toolbar styleClass="mb-4 gap-2">
          <ng-template #start>
            <h2 class="m-0">إدارة التصنيفات</h2>
          </ng-template>
          <ng-template #end>
            <button pButton label="إضافة تصنيف" icon="pi pi-plus" class="p-button-success mr-2" (click)="openNew()"></button>
          </ng-template>
        </p-toolbar>

        <p-table #dt [value]="categories" [rows]="10" [paginator]="true" [loading]="loading"
                 [globalFilterFields]="['code', 'name', 'nameEn']"
                 [tableStyle]="{'min-width': '75rem'}"
                 [rowHover]="true" dataKey="id"
                 currentPageReportTemplate="عرض {first} إلى {last} من أصل {totalRecords} تصنيف"
                 [showCurrentPageReport]="true">
          
          <ng-template pTemplate="caption">
            <div class="flex align-items-center justify-content-between">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="بحث..." />
              </span>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="code" style="min-width:10rem">الكود <p-sortIcon field="code"></p-sortIcon></th>
              <th pSortableColumn="name" style="min-width:15rem">الاسم <p-sortIcon field="name"></p-sortIcon></th>
              <th pSortableColumn="nameEn" style="min-width:15rem">الاسم (إنجليزي) <p-sortIcon field="nameEn"></p-sortIcon></th>
              <th style="min-width:15rem">التصنيف الأب</th>
              <th style="min-width:10rem">عدد الأصناف</th>
              <th style="min-width:10rem">الحالة</th>
              <th style="min-width:10rem">الإجراءات</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-category>
            <tr>
              <td><span class="font-bold">{{ category.code }}</span></td>
              <td>{{ category.name }}</td>
              <td>{{ category.nameEn || '-' }}</td>
              <td>{{ category.parent?.name || '-' }}</td>
              <td>
                <p-tag [value]="category._count?.items || 0" severity="info" [rounded]="true"></p-tag>
              </td>
              <td>
                <p-tag [value]="category.isActive ? 'فعال' : 'غير فعال'" 
                       [severity]="category.isActive ? 'success' : 'danger'"></p-tag>
              </td>
              <td>
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" 
                        (click)="editCategory(category)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-warning" 
                        (click)="deleteCategory(category)"></button>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center p-4">لا توجد تصنيفات مسجلة.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="categoryDialog" [header]="editMode ? 'تعديل تصنيف' : 'إضافة تصنيف'" 
              [modal]="true" [style]="{width: '500px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field">
          <label for="code">الكود *</label>
          <input pInputText id="code" [(ngModel)]="category.code" required [disabled]="editMode" autofocus />
          <small class="p-error" *ngIf="!category.code">الكود مطلوب</small>
        </div>
        <div class="field">
          <label for="name">الاسم (عربي) *</label>
          <input pInputText id="name" [(ngModel)]="category.name" required />
          <small class="p-error" *ngIf="!category.name">الاسم مطلوب</small>
        </div>
        <div class="field">
          <label for="nameEn">الاسم (إنجليزي)</label>
          <input pInputText id="nameEn" [(ngModel)]="category.nameEn" />
        </div>
        <div class="field">
          <label for="parent">التصنيف الأب</label>
          <p-select [options]="parentCategories" [(ngModel)]="category.parentId" 
                    optionLabel="name" optionValue="id" [showClear]="true"
                    placeholder="اختر التصنيف الأب" appendTo="body"></p-select>
        </div>
        <div class="field">
          <label for="description">الوصف</label>
          <textarea pInputText id="description" [(ngModel)]="category.description" rows="3" style="width:100%"></textarea>
        </div>
        <div class="field-checkbox flex align-items-center gap-2">
          <p-toggleswitch [(ngModel)]="category.isActive"></p-toggleswitch>
          <label class="m-0">فعال</label>
        </div>
      </ng-template>
      
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" class="p-button-text" (click)="saveCategory()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .p-dialog .p-button {
      min-width: 6rem;
    }
    
    .field { margin-bottom: 1.5rem; }
    
    .p-input-icon-left {
      position: relative;
      display: inline-block;
      width: 100%;
    }
    
    .p-input-icon-left > i {
      position: absolute;
      top: 50%;
      left: 0.75rem;
      margin-top: -0.5rem;
      color: var(--text-secondary);
    }
    
    .p-input-icon-left > input {
      padding-left: 2.5rem;
      width: 100%;
    }
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
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
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
