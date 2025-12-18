import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService, Item } from '../../core/services/items.service';
import { CategoriesService, Category } from '../../core/services/categories.service';
import { UnitsService, Unit } from '../../core/services/units.service';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, DialogModule, InputTextModule,
    Select, InputNumberModule, Textarea, CheckboxModule,
    ToastModule, ConfirmDialogModule, TagModule, CardModule, SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-left"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">الأصناف</h1>
        <button pButton label="إضافة صنف" icon="pi pi-plus" 
                (click)="openNew()" class="p-button-primary"></button>
      </div>
      
      <!-- Filters -->
      <p-card>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span class="p-input-icon-right w-full">
              <i class="pi pi-search"></i>
              <input pInputText [(ngModel)]="searchQuery" placeholder="بحث بالاسم أو الكود..."
                     (input)="loadItems()" class="w-full" />
            </span>
          </div>
          <div>
            <p-select [options]="categoryOptions" [(ngModel)]="filterCategory"
                        optionLabel="label" optionValue="value" [showClear]="true"
                        placeholder="كل التصنيفات" (onChange)="loadItems()" styleClass="w-full"></p-select>
          </div>
        </div>
      </p-card>
      
      @if (loading) {
        <p-card>
          <div class="space-y-3">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="flex gap-4">
                <p-skeleton width="8%" height="2rem"></p-skeleton>
                <p-skeleton width="20%" height="2rem"></p-skeleton>
                <p-skeleton width="15%" height="2rem"></p-skeleton>
                <p-skeleton width="10%" height="2rem"></p-skeleton>
                <p-skeleton width="10%" height="2rem"></p-skeleton>
                <p-skeleton width="12%" height="2rem"></p-skeleton>
                <p-skeleton width="10%" height="2rem"></p-skeleton>
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
                  class="p-button-outlined p-button-danger" (click)="loadItems()"></button>
        </div>
      }
      
      @if (!loading && !error) {
        <p-card>
          <p-table [value]="items" [paginator]="true" [rows]="10"
                   [showCurrentPageReport]="true" [rowsPerPageOptions]="[10, 25, 50]"
                   currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords} صنف"
                   styleClass="p-datatable-sm p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="code">الكود</th>
                <th pSortableColumn="name">الاسم</th>
                <th>التصنيف</th>
                <th>الوحدة</th>
                <th pSortableColumn="min_qty">الحد الأدنى</th>
                <th pSortableColumn="avg_cost">متوسط التكلفة</th>
                <th pSortableColumn="is_active">الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td class="font-medium">{{ item.code }}</td>
                <td>{{ item.name }}</td>
                <td class="text-gray-500">{{ item.category?.name || '-' }}</td>
                <td class="text-gray-500">{{ item.unit?.name || '-' }}</td>
                <td>{{ item.min_qty }}</td>
                <td>{{ item.avg_cost | number:'1.2-2' }}</td>
                <td>
                  <p-tag [value]="item.is_active ? 'نشط' : 'غير نشط'" 
                         [severity]="item.is_active ? 'success' : 'danger'"></p-tag>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info"
                            (click)="editItem(item)"></button>
                    <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                            (click)="confirmDelete(item)"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-8">
                  <i class="pi pi-inbox text-4xl text-gray-300 mb-3"></i>
                  <p class="text-gray-500">لا توجد أصناف</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      }
      
      <p-dialog [(visible)]="showForm" [modal]="true" [style]="{width: '700px'}"
                [header]="editingItem ? 'تعديل صنف' : 'إضافة صنف'" [closable]="true">
        <div class="space-y-4 pt-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الكود <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="formData.code" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">الباركود</label>
              <input pInputText [(ngModel)]="formData.barcode" class="w-full" />
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
              <label class="font-medium">التصنيف <span class="text-red-500">*</span></label>
              <p-select [options]="categoryOptions" [(ngModel)]="formData.category_id"
                          optionLabel="label" optionValue="value" placeholder="-- اختر --"
                          styleClass="w-full"></p-select>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">وحدة القياس <span class="text-red-500">*</span></label>
              <p-select [options]="unitOptions" [(ngModel)]="formData.unit_id"
                          optionLabel="label" optionValue="value" placeholder="-- اختر --"
                          styleClass="w-full"></p-select>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div class="flex flex-col gap-2">
              <label class="font-medium">الحد الأدنى</label>
              <p-inputNumber [(ngModel)]="formData.min_qty" [min]="0" styleClass="w-full"></p-inputNumber>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">الحد الأقصى</label>
              <p-inputNumber [(ngModel)]="formData.max_qty" [min]="0" styleClass="w-full"></p-inputNumber>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">نقطة إعادة الطلب</label>
              <p-inputNumber [(ngModel)]="formData.reorder_point" [min]="0" styleClass="w-full"></p-inputNumber>
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-medium">الوصف</label>
            <textarea pTextarea [(ngModel)]="formData.description" rows="2" class="w-full"></textarea>
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
            <button pButton [label]="editingItem ? 'تحديث' : 'حفظ'" icon="pi pi-check" 
                    (click)="saveItem()" [loading]="saving"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class ItemsListComponent implements OnInit {
  private itemsService = inject(ItemsService);
  private categoriesService = inject(CategoriesService);
  private unitsService = inject(UnitsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  items: Item[] = [];
  categories: Category[] = [];
  units: Unit[] = [];
  categoryOptions: {label: string, value: string}[] = [];
  unitOptions: {label: string, value: string}[] = [];
  
  showForm = false;
  loading = true;
  saving = false;
  error: string | null = null;
  editingItem: Item | null = null;
  
  searchQuery = '';
  filterCategory = '';
  
  formData: Partial<Item> = this.getEmptyForm();

  ngOnInit() {
    this.loadCategories();
    this.loadUnits();
    this.loadItems();
  }

  getEmptyForm(): Partial<Item> {
    return {
      code: '', barcode: '', name: '', name_en: '', category_id: '',
      unit_id: '', min_qty: 0, max_qty: 0, reorder_point: 0,
      description: '', is_active: true
    };
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.categories = res.data;
        this.categoryOptions = res.data.map(c => ({ label: c.name, value: c.id }));
      }
    });
  }

  loadUnits() {
    this.unitsService.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.units = res.data;
        this.unitOptions = res.data.map(u => ({ label: u.name, value: u.id }));
      }
    });
  }

  loadItems() {
    this.loading = true;
    this.error = null;
    
    const params: any = { limit: 100 };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterCategory) params.category_id = this.filterCategory;
    
    this.itemsService.getAll(params).subscribe({
      next: (res) => { this.items = res.data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ أثناء تحميل الأصناف';
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: this.error || 'خطأ' });
      }
    });
  }

  openNew() { this.editingItem = null; this.formData = this.getEmptyForm(); this.showForm = true; }

  editItem(item: Item) { this.editingItem = item; this.formData = { ...item }; this.showForm = true; }

  saveItem() {
    if (!this.formData.code || !this.formData.name || !this.formData.category_id || !this.formData.unit_id) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }
    this.saving = true;
    const req = this.editingItem
      ? this.itemsService.update(this.editingItem.id, this.formData)
      : this.itemsService.create(this.formData);
    req.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editingItem ? 'تم التحديث' : 'تم الإضافة' });
        this.showForm = false; this.saving = false; this.loadItems();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'حدث خطأ' });
      }
    });
  }

  confirmDelete(item: Item) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف "${item.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.itemsService.delete(item.id).subscribe({
          next: () => { this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم الحذف' }); this.loadItems(); },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'خطأ' })
        });
      }
    });
  }
}
