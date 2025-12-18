import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitsService, Unit } from '../../core/services/units.service';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">وحدات القياس</h1>
        <button (click)="showForm = true; editingUnit = null; resetForm()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          إضافة وحدة
        </button>
      </div>
      
      @if (showForm) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 class="text-xl font-bold mb-4">{{ editingUnit ? 'تعديل' : 'إضافة' }} وحدة قياس</h2>
            <form (ngSubmit)="saveUnit()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الكود</label>
                <input type="text" [(ngModel)]="formData.code" name="code" required
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالعربية</label>
                <input type="text" [(ngModel)]="formData.name" name="name" required
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم بالإنجليزية</label>
                <input type="text" [(ngModel)]="formData.name_en" name="name_en"
                       class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" id="is_active"
                       class="rounded border-gray-300 text-blue-600">
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  {{ editingUnit ? 'تحديث' : 'حفظ' }}
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
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الكود</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الاسم</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الاسم بالإنجليزية</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-6 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (unit of units; track unit.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium">{{ unit.code }}</td>
                <td class="px-6 py-4 text-sm">{{ unit.name }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ unit.name_en || '-' }}</td>
                <td class="px-6 py-4 text-sm">
                  <span [class]="unit.is_active ? 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs' : 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs'">
                    {{ unit.is_active ? 'نشط' : 'غير نشط' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button (click)="editUnit(unit)" class="text-blue-600 hover:text-blue-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button (click)="deleteUnit(unit)" class="text-red-600 hover:text-red-800">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">لا توجد وحدات قياس</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class UnitsListComponent implements OnInit {
  private unitsService = inject(UnitsService);
  units: Unit[] = [];
  showForm = false;
  editingUnit: Unit | null = null;
  formData: Partial<Unit> = { code: '', name: '', name_en: '', is_active: true };

  ngOnInit() { this.loadUnits(); }

  loadUnits() {
    this.unitsService.getAll({ limit: 100 }).subscribe({
      next: (res) => this.units = res.data,
      error: (err) => console.error('Error:', err)
    });
  }

  resetForm() { this.formData = { code: '', name: '', name_en: '', is_active: true }; }

  editUnit(unit: Unit) {
    this.editingUnit = unit;
    this.formData = { ...unit };
    this.showForm = true;
  }

  saveUnit() {
    const request = this.editingUnit
      ? this.unitsService.update(this.editingUnit.id, this.formData)
      : this.unitsService.create(this.formData);
    request.subscribe({ next: () => { this.showForm = false; this.loadUnits(); }, error: (err) => console.error('Error:', err) });
  }

  deleteUnit(unit: Unit) {
    if (confirm(`هل أنت متأكد من حذف "${unit.name}"؟`)) {
      this.unitsService.delete(unit.id).subscribe({ next: () => this.loadUnits(), error: (err) => console.error('Error:', err) });
    }
  }
}
