import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuotationsService, Quotation } from '../../core/services/quotations.service';

@Component({
  selector: 'app-quotations-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">عروض الأسعار</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          عرض سعر جديد
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select [(ngModel)]="filterStatus" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="received">مستلم</option>
            <option value="accepted">مقبول</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم العرض</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المورد</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">صالح حتى</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ الإجمالي</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (q of quotations; track q.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ q.quotation_no }}</td>
                <td class="px-4 py-3 text-sm">{{ q.supplier?.name }}</td>
                <td class="px-4 py-3 text-sm">{{ q.valid_until | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">{{ q.total_amount | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-sm"><span [class]="getStatusClass(q.status)">{{ getStatusName(q.status) }}</span></td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    @if (q.status === 'received') {
                      <button (click)="accept(q)" class="text-green-600 hover:text-green-800" title="قبول">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                      <button (click)="reject(q)" class="text-red-600 hover:text-red-800" title="رفض">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">لا توجد عروض أسعار</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class QuotationsListComponent implements OnInit {
  private service = inject(QuotationsService);
  quotations: Quotation[] = [];
  filterStatus = '';

  ngOnInit() { this.load(); }
  
  load() {
    const params: any = { limit: 50 };
    if (this.filterStatus) params.status = this.filterStatus;
    this.service.getAll(params).subscribe({ next: (res) => this.quotations = res.data });
  }
  
  accept(q: Quotation) { this.service.accept(q.id).subscribe({ next: () => this.load() }); }
  reject(q: Quotation) { this.service.reject(q.id, 'تم الرفض').subscribe({ next: () => this.load() }); }
  
  getStatusName(s: string): string { return { draft: 'مسودة', received: 'مستلم', accepted: 'مقبول', rejected: 'مرفوض', expired: 'منتهي' }[s] || s; }
  getStatusClass(s: string): string {
    return { draft: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', received: 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs', accepted: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs', rejected: 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs' }[s] || '';
  }
}
