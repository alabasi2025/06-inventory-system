import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseOrdersService, PurchaseOrder } from '../../core/services/purchase-orders.service';

@Component({
  selector: 'app-purchase-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">أوامر الشراء</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          أمر شراء جديد
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select [(ngModel)]="filterStatus" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="approved">معتمد</option>
            <option value="sent">مرسل</option>
            <option value="partial">مستلم جزئياً</option>
            <option value="completed">مكتمل</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الأمر</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المورد</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المستودع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">تاريخ الأمر</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التاريخ المتوقع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ الإجمالي</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (o of orders; track o.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ o.order_no }}</td>
                <td class="px-4 py-3 text-sm">{{ o.supplier?.name }}</td>
                <td class="px-4 py-3 text-sm">{{ o.warehouse?.name }}</td>
                <td class="px-4 py-3 text-sm">{{ o.order_date | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">{{ o.expected_date | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">{{ o.total_amount | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-sm"><span [class]="getStatusClass(o.status)">{{ getStatusName(o.status) }}</span></td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    @if (o.status === 'draft') {
                      <button (click)="approve(o)" class="text-green-600 hover:text-green-800" title="اعتماد">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                    }
                    @if (o.status === 'approved') {
                      <button (click)="send(o)" class="text-blue-600 hover:text-blue-800" title="إرسال">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="px-6 py-8 text-center text-gray-500">لا توجد أوامر شراء</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PurchaseOrdersListComponent implements OnInit {
  private service = inject(PurchaseOrdersService);
  orders: PurchaseOrder[] = [];
  filterStatus = '';

  ngOnInit() { this.load(); }
  
  load() {
    const params: any = { limit: 50 };
    if (this.filterStatus) params.status = this.filterStatus;
    this.service.getAll(params).subscribe({ next: (res) => this.orders = res.data });
  }
  
  approve(o: PurchaseOrder) { this.service.approve(o.id).subscribe({ next: () => this.load() }); }
  send(o: PurchaseOrder) { this.service.send(o.id).subscribe({ next: () => this.load() }); }
  
  getStatusName(s: string): string { return { draft: 'مسودة', approved: 'معتمد', sent: 'مرسل', partial: 'مستلم جزئياً', completed: 'مكتمل', cancelled: 'ملغى' }[s] || s; }
  getStatusClass(s: string): string {
    return { draft: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', approved: 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs', sent: 'px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs', partial: 'px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs', completed: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs' }[s] || '';
  }
}
