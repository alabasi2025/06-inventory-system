import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tag } from 'primeng/tag';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { PAGE_STYLES } from '../../shared/styles/page-styles';

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierInvoiceNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  supplier: { id: string; name: string };
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

interface Stats {
  total: number;
  draft: number;
  posted: number;
  partial: number;
  paid: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-purchase-invoices',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, Select, Toast, ConfirmDialog, Tag, InputIcon, IconField,
    InputNumber, DatePicker, Textarea
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <div class="page-header purple">
        <div class="header-content">
          <h1><i class="pi pi-file-edit"></i> فواتير المشتريات</h1>
          <p>إدارة فواتير المشتريات والمدفوعات</p>
        </div>
        <button pButton label="فاتورة جديدة" icon="pi pi-plus" class="header-btn" (click)="showDialog()"></button>
      </div>

      <!-- بطاقات الإحصائيات -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="pi pi-file"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">إجمالي الفواتير</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="pi pi-pencil"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.draft }}</span>
            <span class="stat-label">مسودة</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="pi pi-clock"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.partial }}</span>
            <span class="stat-label">مدفوعة جزئياً</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="pi pi-check-circle"></i></div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.paid }}</span>
            <span class="stat-label">مدفوعة</span>
          </div>
        </div>
      </div>

      <!-- ملخص المبالغ -->
      <div class="amount-summary">
        <div class="amount-card">
          <span class="amount-label">إجمالي الفواتير</span>
          <span class="amount-value">{{ stats.totalAmount | number:'1.2-2' }} ر.ي</span>
        </div>
        <div class="amount-card">
          <span class="amount-label">المدفوع</span>
          <span class="amount-value paid">{{ stats.paidAmount | number:'1.2-2' }} ر.ي</span>
        </div>
        <div class="amount-card">
          <span class="amount-label">المتبقي</span>
          <span class="amount-value remaining">{{ stats.remainingAmount | number:'1.2-2' }} ر.ي</span>
        </div>
      </div>

      <!-- شريط البحث -->
      <div class="search-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input type="text" pInputText [(ngModel)]="searchTerm" (input)="filterInvoices()" placeholder="بحث في الفواتير..." />
        </p-iconfield>
      </div>

      <!-- جدول الفواتير -->
      <div class="table-container">
        <p-table [value]="filteredInvoices" [paginator]="true" [rows]="10" styleClass="p-datatable-sm p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 140px">رقم الفاتورة</th>
              <th style="width: 200px">المورد</th>
              <th style="width: 120px">التاريخ</th>
              <th style="width: 130px">الإجمالي</th>
              <th style="width: 130px">المدفوع</th>
              <th style="width: 130px">المتبقي</th>
              <th style="width: 100px">الحالة</th>
              <th style="width: 150px">الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-invoice>
            <tr>
              <td>
                <span class="code-badge">{{ invoice.invoiceNumber }}</span>
              </td>
              <td>{{ invoice.supplier?.name }}</td>
              <td>{{ invoice.invoiceDate | date:'yyyy-MM-dd' }}</td>
              <td class="amount-cell">{{ invoice.totalAmount | number:'1.2-2' }}</td>
              <td class="amount-cell paid">{{ invoice.paidAmount | number:'1.2-2' }}</td>
              <td class="amount-cell remaining">{{ invoice.remainingAmount | number:'1.2-2' }}</td>
              <td>
                <p-tag [value]="getStatusLabel(invoice.status)" [severity]="getStatusSeverity(invoice.status)"></p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <button pButton icon="pi pi-eye" class="p-button-text p-button-info p-button-sm" (click)="viewInvoice(invoice)"></button>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-warning p-button-sm" (click)="editInvoice(invoice)" [disabled]="invoice.status === 'paid'"></button>
                  @if (invoice.status === 'draft') {
                    <button pButton icon="pi pi-check" class="p-button-text p-button-success p-button-sm" (click)="postInvoice(invoice)"></button>
                  }
                  @if (invoice.status !== 'draft' && invoice.status !== 'paid') {
                    <button pButton icon="pi pi-dollar" class="p-button-text p-button-help p-button-sm" (click)="showPaymentDialog(invoice)"></button>
                  }
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteInvoice(invoice)" [disabled]="invoice.status !== 'draft'"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-4">لا توجد فواتير</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- نافذة إضافة/تعديل فاتورة -->
    <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'تعديل فاتورة' : 'فاتورة جديدة'" [modal]="true" [style]="{width: '600px'}">
      <div class="form-grid">
        <div class="form-group">
          <label>المورد *</label>
          <p-select [options]="suppliers" [(ngModel)]="invoice.supplierId" optionLabel="name" optionValue="id" placeholder="اختر المورد" [style]="{width: '100%'}"></p-select>
        </div>
        <div class="form-group">
          <label>رقم فاتورة المورد</label>
          <input type="text" pInputText [(ngModel)]="invoice.supplierInvoiceNumber" />
        </div>
        <div class="form-group">
          <label>تاريخ الفاتورة *</label>
          <p-datepicker [(ngModel)]="invoice.invoiceDate" dateFormat="yy-mm-dd" [style]="{width: '100%'}"></p-datepicker>
        </div>
        <div class="form-group">
          <label>تاريخ الاستحقاق</label>
          <p-datepicker [(ngModel)]="invoice.dueDate" dateFormat="yy-mm-dd" [style]="{width: '100%'}"></p-datepicker>
        </div>
        <div class="form-group full-width">
          <label>ملاحظات</label>
          <textarea pTextarea [(ngModel)]="invoice.notes" rows="3" [style]="{width: '100%'}"></textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="dialogVisible = false"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveInvoice()"></button>
      </ng-template>
    </p-dialog>

    <!-- نافذة إضافة دفعة -->
    <p-dialog [(visible)]="paymentDialogVisible" header="إضافة دفعة" [modal]="true" [style]="{width: '450px'}">
      <div class="form-grid">
        <div class="form-group full-width">
          <label>المبلغ المتبقي</label>
          <div class="remaining-display">{{ selectedInvoice?.remainingAmount | number:'1.2-2' }} ر.ي</div>
        </div>
        <div class="form-group">
          <label>مبلغ الدفعة *</label>
          <p-inputnumber [(ngModel)]="payment.amount" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" [style]="{width: '100%'}"></p-inputnumber>
        </div>
        <div class="form-group">
          <label>طريقة الدفع *</label>
          <p-select [options]="paymentMethods" [(ngModel)]="payment.paymentMethod" optionLabel="label" optionValue="value" placeholder="اختر طريقة الدفع" [style]="{width: '100%'}"></p-select>
        </div>
        <div class="form-group full-width">
          <label>رقم المرجع</label>
          <input type="text" pInputText [(ngModel)]="payment.referenceNumber" />
        </div>
        <div class="form-group full-width">
          <label>ملاحظات</label>
          <textarea pTextarea [(ngModel)]="payment.notes" rows="2" [style]="{width: '100%'}"></textarea>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="paymentDialogVisible = false"></button>
        <button pButton label="تسجيل الدفعة" icon="pi pi-check" (click)="savePayment()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [PAGE_STYLES, `
    .page-header.purple { background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: white; }
    .stat-icon.blue { background: linear-gradient(135deg, #2196f3, #1976d2); }
    .stat-icon.orange { background: linear-gradient(135deg, #ff9800, #f57c00); }
    .stat-icon.purple { background: linear-gradient(135deg, #9c27b0, #7b1fa2); }
    .stat-icon.green { background: linear-gradient(135deg, #4caf50, #388e3c); }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; display: block; }
    .stat-label { font-size: 0.85rem; color: #64748b; }
    
    .amount-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .amount-card { background: white; border-radius: 12px; padding: 1rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }
    .amount-label { display: block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; }
    .amount-value { display: block; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .amount-value.paid { color: #4caf50; }
    .amount-value.remaining { color: #f44336; }
    
    .amount-cell { font-weight: 600; text-align: left; direction: ltr; }
    .amount-cell.paid { color: #4caf50; }
    .amount-cell.remaining { color: #f44336; }
    
    .remaining-display { font-size: 1.5rem; font-weight: 700; color: #f44336; text-align: center; padding: 1rem; background: #ffebee; border-radius: 8px; }
  `]
})
export class PurchaseInvoicesComponent implements OnInit {
  invoices: PurchaseInvoice[] = [];
  filteredInvoices: PurchaseInvoice[] = [];
  suppliers: any[] = [];
  searchTerm = '';
  dialogVisible = false;
  paymentDialogVisible = false;
  editMode = false;
  selectedInvoice: PurchaseInvoice | null = null;
  
  stats: Stats = { total: 0, draft: 0, posted: 0, partial: 0, paid: 0, totalAmount: 0, paidAmount: 0, remainingAmount: 0 };
  
  invoice: any = {
    supplierId: '',
    supplierInvoiceNumber: '',
    invoiceDate: new Date(),
    dueDate: null,
    notes: ''
  };
  
  payment: any = {
    amount: 0,
    paymentMethod: '',
    referenceNumber: '',
    notes: ''
  };
  
  paymentMethods = [
    { label: 'نقداً', value: 'cash' },
    { label: 'تحويل بنكي', value: 'bank_transfer' },
    { label: 'شيك', value: 'check' }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadInvoices();
    this.loadStats();
    this.loadSuppliers();
  }

  loadInvoices() {
    this.apiService.get('purchase-invoices').subscribe({
      next: (data: any) => {
        this.invoices = data;
        this.filterInvoices();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الفواتير' })
    });
  }

  loadStats() {
    this.apiService.get('purchase-invoices/stats').subscribe({
      next: (data: any) => this.stats = data,
      error: () => {}
    });
  }

  loadSuppliers() {
    this.apiService.getSuppliers().subscribe({
      next: (res: any) => this.suppliers = res.data || res,
      error: () => {}
    });
  }

  filterInvoices() {
    if (!this.searchTerm) {
      this.filteredInvoices = this.invoices;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredInvoices = this.invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.supplier?.name.toLowerCase().includes(term) ||
        inv.supplierInvoiceNumber?.toLowerCase().includes(term)
      );
    }
  }

  showDialog() {
    this.editMode = false;
    this.invoice = {
      supplierId: '',
      supplierInvoiceNumber: '',
      invoiceDate: new Date(),
      dueDate: null,
      notes: ''
    };
    this.dialogVisible = true;
  }

  editInvoice(inv: PurchaseInvoice) {
    this.editMode = true;
    this.selectedInvoice = inv;
    this.invoice = {
      supplierId: inv.supplier.id,
      supplierInvoiceNumber: inv.supplierInvoiceNumber || '',
      invoiceDate: new Date(inv.invoiceDate),
      dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
      notes: ''
    };
    this.dialogVisible = true;
  }

  viewInvoice(inv: PurchaseInvoice) {
    this.messageService.add({ severity: 'info', summary: 'عرض', detail: 'رقم الفاتورة: ' + inv.invoiceNumber });
  }

  saveInvoice() {
    if (!this.invoice.supplierId || !this.invoice.invoiceDate) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    const payload = {
      supplierId: this.invoice.supplierId,
      supplierInvoiceNumber: this.invoice.supplierInvoiceNumber,
      invoiceDate: this.invoice.invoiceDate instanceof Date ? this.invoice.invoiceDate.toISOString() : this.invoice.invoiceDate,
      dueDate: this.invoice.dueDate instanceof Date ? this.invoice.dueDate.toISOString() : this.invoice.dueDate,
      notes: this.invoice.notes
    };

    if (this.editMode && this.selectedInvoice) {
      this.apiService.patch('purchase-invoices/' + this.selectedInvoice.id, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث الفاتورة' });
          this.dialogVisible = false;
          this.loadInvoices();
          this.loadStats();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث الفاتورة' })
      });
    } else {
      this.apiService.post('purchase-invoices', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء الفاتورة' });
          this.dialogVisible = false;
          this.loadInvoices();
          this.loadStats();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إنشاء الفاتورة' })
      });
    }
  }

  postInvoice(inv: PurchaseInvoice) {
    this.confirmationService.confirm({
      message: 'هل تريد ترحيل هذه الفاتورة؟',
      header: 'تأكيد الترحيل',
      icon: 'pi pi-check',
      accept: () => {
        this.apiService.post('purchase-invoices/' + inv.id + '/post', {}).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم ترحيل الفاتورة' });
            this.loadInvoices();
            this.loadStats();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل ترحيل الفاتورة' })
        });
      }
    });
  }

  showPaymentDialog(inv: PurchaseInvoice) {
    this.selectedInvoice = inv;
    this.payment = {
      amount: Number(inv.remainingAmount),
      paymentMethod: '',
      referenceNumber: '',
      notes: ''
    };
    this.paymentDialogVisible = true;
  }

  savePayment() {
    if (!this.payment.amount || !this.payment.paymentMethod) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    this.apiService.post('purchase-invoices/' + this.selectedInvoice?.id + '/payment', this.payment).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تسجيل الدفعة' });
        this.paymentDialogVisible = false;
        this.loadInvoices();
        this.loadStats();
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل تسجيل الدفعة' })
    });
  }

  deleteInvoice(inv: PurchaseInvoice) {
    this.confirmationService.confirm({
      message: 'هل تريد حذف هذه الفاتورة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-trash',
      accept: () => {
        this.apiService.delete('purchase-invoices/' + inv.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الفاتورة' });
            this.loadInvoices();
            this.loadStats();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل حذف الفاتورة' })
        });
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      draft: 'مسودة',
      posted: 'مُرحّلة',
      partial: 'مدفوعة جزئياً',
      paid: 'مدفوعة',
      cancelled: 'ملغاة'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined {
    const severities: { [key: string]: "success" | "secondary" | "info" | "warn" | "danger" } = {
      draft: 'secondary',
      posted: 'info',
      partial: 'warn',
      paid: 'success',
      cancelled: 'danger'
    };
    return severities[status];
  }
}
