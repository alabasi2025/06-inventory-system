import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementsService, Movement } from '../../core/services/movements.service';
import { WarehousesService, Warehouse } from '../../core/services/warehouses.service';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">حركات المخزون</h1>
        <button (click)="showForm = true; resetForm()"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          حركة جديدة
        </button>
      </div>
      
      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select [(ngModel)]="filterType" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الأنواع</option>
            <option value="receipt">استلام</option>
            <option value="issue">صرف</option>
            <option value="transfer">تحويل</option>
            <option value="adjustment">تسوية</option>
          </select>
          <select [(ngModel)]="filterWarehouse" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل المستودعات</option>
            @for (w of warehouses; track w.id) {
              <option [value]="w.id">{{ w.name }}</option>
            }
          </select>
          <select [(ngModel)]="filterStatus" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
      </div>
      
      @if (showForm) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 class="text-xl font-bold mb-4">حركة مخزون جديدة</h2>
            <form (ngSubmit)="save()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نوع الحركة *</label>
                <select [(ngModel)]="formData.type" name="type" required class="w-full border rounded-lg px-3 py-2">
                  <option value="receipt">استلام</option>
                  <option value="issue">صرف</option>
                  <option value="transfer">تحويل</option>
                  <option value="adjustment">تسوية</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المستودع *</label>
                <select [(ngModel)]="formData.warehouseId" name="warehouseId" required class="w-full border rounded-lg px-3 py-2">
                  <option value="">-- اختر --</option>
                  @for (w of warehouses; track w.id) {
                    <option [value]="w.id">{{ w.name }}</option>
                  }
                </select>
              </div>
              @if (formData.type === 'transfer') {
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">المستودع المستلم *</label>
                  <select [(ngModel)]="formData.toWarehouseId" name="toWarehouseId" class="w-full border rounded-lg px-3 py-2">
                    <option value="">-- اختر --</option>
                    @for (w of warehouses; track w.id) {
                      <option [value]="w.id">{{ w.name }}</option>
                    }
                  </select>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الحركة</label>
                <input type="date" [(ngModel)]="formData.movementDate" name="movementDate"
                       class="w-full border rounded-lg px-3 py-2">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea [(ngModel)]="formData.notes" name="notes" rows="2"
                          class="w-full border rounded-lg px-3 py-2"></textarea>
              </div>
              <div class="flex gap-3 pt-4">
                <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">حفظ</button>
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
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الحركة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">النوع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المستودع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التاريخ</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (m of movements; track m.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ m.movement_no }}</td>
                <td class="px-4 py-3 text-sm">
                  <span [class]="getTypeClass(m.type)">{{ getTypeName(m.type) }}</span>
                </td>
                <td class="px-4 py-3 text-sm">{{ m.warehouse?.name }}</td>
                <td class="px-4 py-3 text-sm">{{ m.movement_date | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">
                  <span [class]="getStatusClass(m.status)">{{ getStatusName(m.status) }}</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    @if (m.status === 'draft') {
                      <button (click)="confirm(m)" class="text-green-600 hover:text-green-800" title="تأكيد">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                      <button (click)="cancel(m)" class="text-red-600 hover:text-red-800" title="إلغاء">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">لا توجد حركات</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MovementsListComponent implements OnInit {
  private service = inject(MovementsService);
  private warehousesService = inject(WarehousesService);
  
  movements: Movement[] = [];
  warehouses: Warehouse[] = [];
  showForm = false;
  filterType = '';
  filterWarehouse = '';
  filterStatus = '';
  formData: any = { type: 'receipt', warehouseId: '', toWarehouseId: '', movementDate: '', notes: '' };

  ngOnInit() { this.loadWarehouses(); this.load(); }
  
  loadWarehouses() {
    this.warehousesService.getAll({ limit: 100 }).subscribe({ next: (res) => this.warehouses = res.data });
  }
  
  load() {
    const params: any = { limit: 50 };
    if (this.filterType) params.type = this.filterType;
    if (this.filterWarehouse) params.warehouseId = this.filterWarehouse;
    if (this.filterStatus) params.status = this.filterStatus;
    this.service.getAll(params).subscribe({ next: (res) => this.movements = res.data });
  }
  
  resetForm() { this.formData = { type: 'receipt', warehouseId: '', toWarehouseId: '', movementDate: new Date().toISOString().split('T')[0], notes: '' }; }
  
  save() {
    this.service.create(this.formData).subscribe({ next: () => { this.showForm = false; this.load(); } });
  }
  
  confirm(m: Movement) {
    if (confirm('هل أنت متأكد من تأكيد هذه الحركة؟')) {
      this.service.confirm(m.id).subscribe({ next: () => this.load() });
    }
  }
  
  cancel(m: Movement) {
    if (confirm('هل أنت متأكد من إلغاء هذه الحركة؟')) {
      this.service.cancel(m.id).subscribe({ next: () => this.load() });
    }
  }
  
  getTypeName(type: string): string { return { receipt: 'استلام', issue: 'صرف', transfer: 'تحويل', adjustment: 'تسوية' }[type] || type; }
  getTypeClass(type: string): string {
    return { receipt: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs', issue: 'px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs', transfer: 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs', adjustment: 'px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs' }[type] || '';
  }
  getStatusName(status: string): string { return { draft: 'مسودة', confirmed: 'مؤكد', cancelled: 'ملغى' }[status] || status; }
  getStatusClass(status: string): string {
    return { draft: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', confirmed: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs', cancelled: 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs' }[status] || '';
  }
}
