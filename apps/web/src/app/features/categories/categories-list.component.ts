import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from '../../core/services/categories.service';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">التصنيفات</h1>
        <button (click)="showForm = true; editingCategory = null; resetForm()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          إضافة تصنيف
        </button>
      </div>
      
      <!-- Form Modal -->
      @if (showForm) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">{{ editingCategory ? 'تعديل' : 'إضافة' }} تصنيف</h2>
            
            <form (ngSubmit)="saveCategory()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الكود</label>
                <input type="text" [(ngModel)]="formData.code" name="code" required
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
                <input type="text" [(ngModel)]="formData.name_en" name="name_en"
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">التصنيف الأب</label>
                <select [(ngModel)]="formData.parent_id" name="parent_id"
                        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option [ngValue]="null">-- بدون --</option>
                  @for (cat of categories; track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea [(ngModel)]="formData.description" name="description" rows="3"
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" id="is_active"
                       class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              
              <div class="flex gap-3 pt-4">
                <button type="submit" 
                        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  {{ editingCategory ? 'تحديث' : 'حفظ' }}
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
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الكود</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الاسم</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">التصنيف الأب</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (category of categories; track category.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium">{{ category.code }}</td>
                <td class="px-6 py-4 text-sm">{{ category.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ getParentName(category.parent_id) }}</td>
                <td class="px-6 py-4 text-sm">
                  <span [class]="category.is_active ? 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs' : 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'">
                    {{ category.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button (click)="editCategory(category)" 
                            class="text-blue-600 hover:text-blue-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="deleteCategory(category)" 
                            class="text-red-600 hover:text-red-800">
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
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">لا توجد تصنيفات</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CategoriesListComponent implements OnInit {
  private categoriesService = inject(CategoriesService);
  
  categories: Category[] = [];
  showForm = false;
  editingCategory: Category | null = null;
  formData: Partial<Category> = {
    code: '',
    name: '',
    name_en: '',
    parent_id: undefined,
    description: '',
    is_active: true
  };

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesService.getAll({ limit: 100 }).subscribe({
      next: (res) => this.categories = res.data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  resetForm() {
    this.formData = {
      code: '',
      name: '',
      name_en: '',
      parent_id: undefined,
      description: '',
      is_active: true
    };
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.formData = { ...category };
    this.showForm = true;
  }

  saveCategory() {
    const data = { ...this.formData };
    if (!data.parent_id) delete data.parent_id;
    
    const request = this.editingCategory
      ? this.categoriesService.update(this.editingCategory.id, data)
      : this.categoriesService.create(data);
    
    request.subscribe({
      next: () => {
        this.showForm = false;
        this.loadCategories();
      },
      error: (err) => console.error('Error saving category:', err)
    });
  }

  deleteCategory(category: Category) {
    if (confirm(`هل أنت متأكد من حذف التصنيف "${category.name}"؟`)) {
      this.categoriesService.delete(category.id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error('Error deleting category:', err)
      });
    }
  }

  getParentName(parentId?: string): string {
    if (!parentId) return '-';
    const parent = this.categories.find(c => c.id === parentId);
    return parent?.name || '-';
  }
}
