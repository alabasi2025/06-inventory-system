import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SuppliersService, Supplier } from '../../core/services/suppliers.service';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">الموردين</h1>
        <button (click)="showForm = true; editing = null; resetForm()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          إضافة مورد
        </button>
      </div>
      
      @if (showForm) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div class="bg-white rounded-xl p-6 w-full max-w-2xl m-4">
            <h2 class="text-xl font-bold mb-4">{{ editing ? 'تعديل' : 'إضافة' }} مورد</h2>
            <form (ngSubmit)="save()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
                  <input type="text" [(ngModel)]="formData.code" name="code" required
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                  <select [(ngModel)]="formData.type" name="type"
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="local">محلي</option>
                    <option value="international">دولي</option>
                  </select>
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
                  <label class="block text-sm font-medium text-gray-700 mb-1">الرقم الضريبي</label>
                  <input type="text" [(ngModel)]="formData.tax_number" name="tax_number"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">السجل التجاري</label>
                  <input type="text" [(ngModel)]="formData.commercial_reg" name="commercial_reg"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">جهة الاتصال</label>
                  <input type="text" [(ngModel)]="formData.contact_person" name="contact_person"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                  <input type="text" [(ngModel)]="formData.phone" name="phone"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <input type="email" [(ngModel)]="formData.email" name="email"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <input type="text" [(ngModel)]="formData.city" name="city"
                         class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <textarea [(ngModel)]="formData.address" name="address" rows="2"
                          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" id="is_active"
                       class="rounded border-gray-300 text-blue-600">
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  {{ editing ? 'تحديث' : 'حفظ' }}
                </button>
                <button type="button" (click)="showForm = false"
                        class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      }
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الكود</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الاسم</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">النوع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">جهة الاتصال</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الهاتف</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التقييم</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (s of suppliers; track s.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ s.code }}</td>
                <td class="px-4 py-3 text-sm">{{ s.name }}</td>
                <td class="px-4 py-3 text-sm">{{ s.type === 'local' ? 'محلي' : 'دولي' }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ s.contact_person || '-' }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ s.phone || '-' }}</td>
                <td class="px-4 py-3 text-sm">
                  @if (s.rating) {
                    <span class="text-yellow-500">★</span> {{ s.rating }}/5
                  } @else { - }
                </td>
                <td class="px-4 py-3 text-sm">
                  <span [class]="s.is_active ? 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs' : 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'">
                    {{ s.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    <button (click)="edit(s)" class="text-blue-600 hover:text-blue-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="remove(s)" class="text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="px-6 py-8 text-center text-gray-500">لا يوجد موردين</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SuppliersListComponent implements OnInit {
  private service = inject(SuppliersService);
  suppliers: Supplier[] = [];
  showForm = false;
  editing: Supplier | null = null;
  formData: Partial<Supplier> = { code: '', name: '', name_en: '', type: 'local', tax_number: '', commercial_reg: '', contact_person: '', phone: '', email: '', address: '', city: '', is_active: true };

  ngOnInit() { this.load(); }
  load() { this.service.getAll({ limit: 100 }).subscribe({ next: (res) => this.suppliers = res.data, error: (err) => console.error(err) }); }
  resetForm() { this.formData = { code: '', name: '', name_en: '', type: 'local', tax_number: '', commercial_reg: '', contact_person: '', phone: '', email: '', address: '', city: '', is_active: true }; }
  edit(s: Supplier) { this.editing = s; this.formData = { ...s }; this.showForm = true; }
  save() {
    const req = this.editing ? this.service.update(this.editing.id, this.formData) : this.service.create(this.formData);
    req.subscribe({ next: () => { this.showForm = false; this.load(); }, error: (err) => console.error(err) });
  }
  remove(s: Supplier) {
    if (confirm(`هل أنت متأكد من حذف "${s.name}"؟`)) {
      this.service.delete(s.id).subscribe({ next: () => this.load(), error: (err) => console.error(err) });
    }
  }
}
