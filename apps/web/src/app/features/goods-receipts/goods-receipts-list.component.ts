import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoodsReceiptsService, GoodsReceipt } from '../../core/services/goods-receipts.service';

@Component({
  selector: 'app-goods-receipts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">محاضر الاستلام</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          محضر استلام جديد
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select [(ngModel)]="filterStatus" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="confirmed">مؤكد</option>
            <option value="cancelled">ملغى</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم المحضر</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم أمر الشراء</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الاستلام</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم إذن الدخول</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">فاتورة المورد</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (r of receipts; track r.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ r.receipt_no }}</td>
                <td class="px-4 py-3 text-sm">{{ r.order?.order_no }}</td>
                <td class="px-4 py-3 text-sm">{{ r.receipt_date | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">{{ r.gate_pass_no || '-' }}</td>
                <td class="px-4 py-3 text-sm">{{ r.supplier_invoice_no || '-' }}</td>
                <td class="px-4 py-3 text-sm"><span [class]="getStatusClass(r.status)">{{ getStatusName(r.status) }}</span></td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    @if (r.status === 'draft') {
                      <button (click)="confirm(r)" class="text-green-600 hover:text-green-800" title="تأكيد">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                      <button (click)="cancel(r)" class="text-red-600 hover:text-red-800" title="إلغاء">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">لا توجد محاضر استلام</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class GoodsReceiptsListComponent implements OnInit {
  private service = inject(GoodsReceiptsService);
  receipts: GoodsReceipt[] = [];
  filterStatus = '';

  ngOnInit() { this.load(); }
  
  load() {
    const params: any = { limit: 50 };
    if (this.filterStatus) params.status = this.filterStatus;
    this.service.getAll(params).subscribe({ next: (res) => this.receipts = res.data });
  }
  
  confirm(r: GoodsReceipt) { this.service.confirm(r.id).subscribe({ next: () => this.load() }); }
  cancel(r: GoodsReceipt) { this.service.cancel(r.id).subscribe({ next: () => this.load() }); }
  
  getStatusName(s: string): string { return { draft: 'مسودة', confirmed: 'مؤكد', cancelled: 'ملغى' }[s] || s; }
  getStatusClass(s: string): string {
    return { draft: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', confirmed: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs', cancelled: 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs' }[s] || '';
  }
}
