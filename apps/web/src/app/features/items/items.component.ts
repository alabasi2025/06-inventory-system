import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toolbar } from 'primeng/toolbar';
import { Tag } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, InputNumber, Select, ToggleSwitch, Toast, ConfirmDialog, Toolbar, Tag
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>الأصناف</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إضافة صنف" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="items" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">الكود</th>
            <th pSortableColumn="name">الاسم</th>
            <th>التصنيف</th>
            <th>الوحدة</th>
            <th>الرصيد</th>
            <th>متوسط التكلفة</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.category?.name || '-' }}</td>
            <td>{{ item.unit?.name || '-' }}</td>
            <td>
              <p-tag [value]="item.totalStock + ''" 
                     [severity]="getStockSeverity(item.totalStock, item.minStock)"></p-tag>
            </td>
            <td>{{ item.avgCost | number:'1.2-2' }}</td>
            <td>
              <span [class]="'status-badge ' + (item.isActive ? 'active' : 'inactive')">
                {{ item.isActive ? 'فعال' : 'غير فعال' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      (click)="editItem(item)"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      (click)="deleteItem(item)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="8" class="text-center">لا توجد أصناف</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="itemDialog" [header]="editMode ? 'تعديل صنف' : 'إضافة صنف'" 
              [modal]="true" [style]="{width: '600px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="grid">
          <div class="col-6">
            <div class="field">
              <label for="code">الكود *</label>
              <input pInputText id="code" [(ngModel)]="item.code" required [disabled]="editMode" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="barcode">الباركود</label>
              <input pInputText id="barcode" [(ngModel)]="item.barcode" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="name">الاسم (عربي) *</label>
              <input pInputText id="name" [(ngModel)]="item.name" required />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="nameEn">الاسم (إنجليزي)</label>
              <input pInputText id="nameEn" [(ngModel)]="item.nameEn" />
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="category">التصنيف *</label>
              <p-select [options]="categories" [(ngModel)]="item.categoryId" 
                        optionLabel="name" optionValue="id" placeholder="اختر التصنيف"></p-select>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="unit">الوحدة *</label>
              <p-select [options]="units" [(ngModel)]="item.unitId" 
                        optionLabel="name" optionValue="id" placeholder="اختر الوحدة"></p-select>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="minStock">الحد الأدنى</label>
              <p-inputnumber [(ngModel)]="item.minStock" [min]="0"></p-inputnumber>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="maxStock">الحد الأقصى</label>
              <p-inputnumber [(ngModel)]="item.maxStock" [min]="0"></p-inputnumber>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="reorderPoint">نقطة إعادة الطلب</label>
              <p-inputnumber [(ngModel)]="item.reorderPoint" [min]="0"></p-inputnumber>
            </div>
          </div>
          <div class="col-6">
            <div class="field">
              <label for="reorderQty">كمية إعادة الطلب</label>
              <p-inputnumber [(ngModel)]="item.reorderQty" [min]="0"></p-inputnumber>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label for="description">الوصف</label>
              <input pInputText id="description" [(ngModel)]="item.description" />
            </div>
          </div>
          <div class="col-12">
            <div class="field-checkbox">
              <p-toggleswitch [(ngModel)]="item.isActive"></p-toggleswitch>
              <label>فعال</label>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveItem()"></button>
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
export class ItemsComponent implements OnInit {
  items: any[] = [];
  categories: any[] = [];
  units: any[] = [];
  item: any = {};
  itemDialog = false;
  editMode = false;
  loading = false;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadItems();
    this.loadCategories();
    this.loadUnits();
  }

  loadItems() {
    this.loading = true;
    this.api.getItems({ take: 100 }).subscribe({
      next: (res) => {
        this.items = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الأصناف' });
      }
    });
  }

  loadCategories() {
    this.api.getCategories({ take: 100, isActive: true }).subscribe({
      next: (res) => this.categories = res.data
    });
  }

  loadUnits() {
    this.api.getUnits({ take: 100, isActive: true }).subscribe({
      next: (res) => this.units = res.data
    });
  }

  getStockSeverity(stock: number, minStock: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (stock === 0) return 'danger';
    if (stock <= minStock) return 'warn';
    return 'success';
  }

  openNew() {
    this.item = { isActive: true, minStock: 0 };
    this.editMode = false;
    this.itemDialog = true;
  }

  editItem(item: any) {
    this.item = { ...item };
    this.editMode = true;
    this.itemDialog = true;
  }

  deleteItem(item: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الصنف "${item.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.deleteItem(item.id).subscribe({
          next: () => {
            this.loadItems();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الصنف' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حذف الصنف' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.itemDialog = false;
  }

  saveItem() {
    if (!this.item.code || !this.item.name || !this.item.categoryId || !this.item.unitId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    const action = this.editMode
      ? this.api.updateItem(this.item.id, this.item)
      : this.api.createItem(this.item);

    action.subscribe({
      next: () => {
        this.loadItems();
        this.hideDialog();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editMode ? 'تم تحديث الصنف' : 'تم إضافة الصنف' 
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ الصنف' });
      }
    });
  }
}
