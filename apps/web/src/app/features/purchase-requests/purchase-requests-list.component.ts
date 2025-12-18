import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchaseRequestsService, PurchaseRequest } from '../../core/services/purchase-requests.service';

@Component({
  selector: 'app-purchase-requests-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">طلبات الشراء</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          طلب شراء جديد
        </button>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select [(ngModel)]="filterStatus" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الحالات</option>
            <option value="draft">مسودة</option>
            <option value="submitted">مقدم</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
            <option value="converted">محول</option>
          </select>
          <select [(ngModel)]="filterPriority" (change)="load()" class="border rounded-lg px-3 py-2">
            <option value="">كل الأولويات</option>
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
            <option value="urgent">عاجلة</option>
          </select>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم الطلب</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المستودع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الأولوية</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">التاريخ المطلوب</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ التقديري</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (r of requests; track r.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium">{{ r.request_no }}</td>
                <td class="px-4 py-3 text-sm">{{ r.warehouse?.name }}</td>
                <td class="px-4 py-3 text-sm"><span [class]="getPriorityClass(r.priority)">{{ getPriorityName(r.priority) }}</span></td>
                <td class="px-4 py-3 text-sm">{{ r.required_date | date:'yyyy-MM-dd' }}</td>
                <td class="px-4 py-3 text-sm">{{ r.total_estimated | number:'1.2-2' }}</td>
                <td class="px-4 py-3 text-sm"><span [class]="getStatusClass(r.status)">{{ getStatusName(r.status) }}</span></td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex gap-2">
                    @if (r.status === 'draft') {
                      <button (click)="submit(r)" class="text-blue-600 hover:text-blue-800" title="تقديم">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                      </button>
                    }
                    @if (r.status === 'submitted') {
                      <button (click)="approve(r)" class="text-green-600 hover:text-green-800" title="موافقة">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                      </button>
                      <button (click)="reject(r)" class="text-red-600 hover:text-red-800" title="رفض">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">لا توجد طلبات شراء</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class PurchaseRequestsListComponent implements OnInit {
  private service = inject(PurchaseRequestsService);
  requests: PurchaseRequest[] = [];
  filterStatus = '';
  filterPriority = '';

  ngOnInit() { this.load(); }
  
  load() {
    const params: any = { limit: 50 };
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterPriority) params.priority = this.filterPriority;
    this.service.getAll(params).subscribe({ next: (res) => this.requests = res.data });
  }
  
  submit(r: PurchaseRequest) { this.service.submit(r.id).subscribe({ next: () => this.load() }); }
  approve(r: PurchaseRequest) { this.service.approve(r.id).subscribe({ next: () => this.load() }); }
  reject(r: PurchaseRequest) { this.service.reject(r.id, 'تم الرفض').subscribe({ next: () => this.load() }); }
  
  getPriorityName(p: string): string { return { low: 'منخفضة', medium: 'متوسطة', high: 'عالية', urgent: 'عاجلة' }[p] || p; }
  getPriorityClass(p: string): string {
    return { low: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', medium: 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs', high: 'px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs', urgent: 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs' }[p] || '';
  }
  getStatusName(s: string): string { return { draft: 'مسودة', submitted: 'مقدم', approved: 'معتمد', rejected: 'مرفوض', converted: 'محول', cancelled: 'ملغى' }[s] || s; }
  getStatusClass(s: string): string {
    return { draft: 'px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs', submitted: 'px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs', approved: 'px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs', rejected: 'px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs', converted: 'px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs' }[s] || '';
  }
}
