import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemsService, Item } from '../../core/services/items.service';
import { CategoriesService, Category } from '../../core/services/categories.service';
import { UnitsService, Unit } from '../../core/services/units.service';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">الأصناف</h1>
        <button (click)="showForm = true; editingItem = null; resetForm()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          إضافة صنف
        </button>
      </div>
      
      <!-- Search & Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input type="text" [(ngModel)]="searchQuery" placeholder="بحث بالاسم أو الكود..."
                   (input)="loadItems()"
                   class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <select [(ngModel)]="filterCategory" (change)="loadItems()"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">كل التصنيفات</option>
              @for (cat of categories; track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>
      
      <!-- Form Modal -->
      @if (showForm) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl m-4">
            <h2 class="text-xl font-bold mb-4">{{ editingItem ? 'تعديل' : 'إضافة' }} صنف</h2>
            
            <form (ngSubmit)="saveItem()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
                  <input type="text" [(ngModel)]="formData.code" name="code" required
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                  <input type="text" [(ngModel)]="formData.barcode" name="barcode"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية *</label>
                  <input type="text" [(ngModel)]="formData.name" name="name" required
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
                  <input type="text" [(ngModel)]="formData.name_en" name="name_en"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف *</label>
                  <select [(ngModel)]="formData.category_id" name="category_id" required
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">-- اختر --</option>
                    @for (cat of categories; track cat.id) {
                      <option [value]="cat.id">{{ cat.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">وحدة القياس *</label>
                  <select [(ngModel)]="formData.unit_id" name="unit_id" required
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">-- اختر --</option>
                    @for (unit of units; track unit.id) {
                      <option [value]="unit.id">{{ unit.name }}</option>
                    }
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى</label>
                  <input type="number" [(ngModel)]="formData.min_qty" name="min_qty" min="0"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى</label>
                  <input type="number" [(ngModel)]="formData.max_qty" name="max_qty" min="0"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">نقطة إعادة الطلب</label>
                  <input type="number" [(ngModel)]="formData.reorder_point" name="reorder_point" min="0"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="2"
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" id="is_active"
                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button type="submit" 
                        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  {{ editingItem ? 'تحديث' : 'حفظ' }}
                </button>
                <button type="button" (click)="showForm = false"
                        class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      
      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الكود</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الاسم</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التصنيف</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الوحدة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحد الأدنى</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">متوسط التكلفة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (item of items; track item.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ item.code }}</td>
                <td class="px-4 py-3 text-sm">{{ item.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ item.category?.name }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ item.unit?.name }}</td>
                <td class="px-4 py-3 text-sm">{{ item.min_qty }}</td>
                <td class="px-4 py-3 text-sm">{{ item.avg_cost | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-sm">
                  <span [class]="item.is_active ? 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs' : 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'">
                    {{ item.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <button (click)="editItem(item)" class="text-blue-600 hover:text-blue-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="deleteItem(item)" class="text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">لا توجد أصناف</td>
              </tr>
            }
          </tbody>
        </table>
        
        <!-- Pagination -->
        @if (totalPages > 1) {
          <div class="px-6 py-4 border-t flex items-center justify-between">
            <span class="text-sm text-gray-600">
              عرض {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }} من {{ totalItems }}
            </span>
            <div class="flex gap-2">
              <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1"
                      class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">السابق</button>
              <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages"
                      class="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">التالي</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ItemsListComponent implements OnInit {
  private itemsService = inject(ItemsService);
  private categoriesService = inject(CategoriesService);
  private unitsService = inject(UnitsService);
  
  items: Item[] = [];
  categories: Category[] = [];
  units: Unit[] = [];
  
  showForm = false;
  editingItem: Item | null = null;
  searchQuery = '';
  filterCategory = '';
  
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;
  
  formData: Partial<Item> = {
    code: '',
    barcode: '',
    name: '',
    name_en: '',
    category_id: '',
    unit_id: '',
    description: '',
    min_qty: 0,
    max_qty: 0,
    reorder_point: 0,
    is_active: true
  };

  ngOnInit() {
    this.loadCategories();
    this.loadUnits();
    this.loadItems();
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (res) => this.categories = res.data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadUnits() {
    this.unitsService.getAll({ limit: 100 }).subscribe({
      next: (res) => this.units = res.data,
      error: (err) => console.error('Error loading units:', err)
    });
  }

  loadItems() {
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterCategory) params.categoryId = this.filterCategory;
    
    this.itemsService.getAll(params).subscribe({
      next: (res) => {
        this.items = res.data;
        this.totalItems = res.meta.total;
        this.totalPages = res.meta.totalPages;
      },
      error: (err) => console.error('Error loading items:', err)
    });
  }

  resetForm() {
    this.formData = {
      code: '',
      barcode: '',
      name: '',
      name_en: '',
      category_id: '',
      unit_id: '',
      description: '',
      min_qty: 0,
      max_qty: 0,
      reorder_point: 0,
      is_active: true
    };
  }

  editItem(item: Item) {
    this.editingItem = item;
    this.formData = { ...item };
    this.showForm = true;
  }

  saveItem() {
    const data = { ...this.formData };
    
    const request = this.editingItem
      ? this.itemsService.update(this.editingItem.id, data)
      : this.itemsService.create(data);
    
    request.subscribe({
      next: () => {
        this.showForm = false;
        this.loadItems();
      },
      error: (err) => console.error('Error saving item:', err)
    });
  }

  deleteItem(item: Item) {
    if (confirm(`هل أنت متأكد من حذف الصنف "${item.name}"؟`)) {
      this.itemsService.delete(item.id).subscribe({
        next: () => this.loadItems(),
        error: (err) => console.error('Error deleting item:', err)
      });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }
}
