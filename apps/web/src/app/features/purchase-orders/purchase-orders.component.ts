import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toolbar } from 'primeng/toolbar';
import { Tag } from 'primeng/tag';
import { Stepper } from 'primeng/stepper';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, InputNumber, Select, DatePicker, Toast, ConfirmDialog, Toolbar, Tag, Stepper
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>أوامر الشراء</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إنشاء أمر شراء" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="orders" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="orderNo">رقم الأمر</th>
            <th>المورد</th>
            <th>التاريخ</th>
            <th>عدد الأصناف</th>
            <th>الإجمالي</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-order>
          <tr>
            <td>{{ order.orderNo }}</td>
            <td>{{ order.supplier?.name }}</td>
            <td>{{ order.orderDate | date:'yyyy-MM-dd' }}</td>
            <td>{{ order.items?.length || 0 }}</td>
            <td>{{ order.totalAmount | number:'1.2-2' }}</td>
            <td>
              <p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)"></p-tag>
            </td>
            <td>
              <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text" 
                      (click)="viewOrder(order)" pTooltip="عرض"></button>
              <button *ngIf="order.status === 'draft'" pButton icon="pi pi-pencil" 
                      class="p-button-rounded p-button-text" (click)="editOrder(order)" pTooltip="تعديل"></button>
              <button *ngIf="order.status === 'draft'" pButton icon="pi pi-send" 
                      class="p-button-rounded p-button-text p-button-info" 
                      (click)="submitOrder(order)" pTooltip="إرسال للموافقة"></button>
              <button *ngIf="order.status === 'pending'" pButton icon="pi pi-check" 
                      class="p-button-rounded p-button-text p-button-success" 
                      (click)="approveOrder(order)" pTooltip="اعتماد"></button>
              <button *ngIf="order.status === 'approved'" pButton icon="pi pi-envelope" 
                      class="p-button-rounded p-button-text p-button-warning" 
                      (click)="sendOrder(order)" pTooltip="إرسال للمورد"></button>
              <button *ngIf="order.status === 'sent'" pButton icon="pi pi-inbox" 
                      class="p-button-rounded p-button-text p-button-success" 
                      (click)="openReceiveDialog(order)" pTooltip="استلام"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">لا توجد أوامر شراء</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="orderDialog" [header]="editMode ? 'تعديل أمر شراء' : 'إنشاء أمر شراء'" 
              [modal]="true" [style]="{width: '900px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="grid">
          <div class="col-4">
            <div class="field">
              <label>المورد *</label>
              <p-select [options]="suppliers" [(ngModel)]="order.supplierId" 
                        optionLabel="name" optionValue="id" placeholder="اختر المورد"
                        [filter]="true" filterBy="name,code"></p-select>
            </div>
          </div>
          <div class="col-4">
            <div class="field">
              <label>تاريخ الأمر</label>
              <p-datepicker [(ngModel)]="order.orderDate" dateFormat="yy-mm-dd"></p-datepicker>
            </div>
          </div>
          <div class="col-4">
            <div class="field">
              <label>تاريخ التسليم المتوقع</label>
              <p-datepicker [(ngModel)]="order.expectedDate" dateFormat="yy-mm-dd"></p-datepicker>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label>ملاحظات</label>
              <input pInputText [(ngModel)]="order.notes" />
            </div>
          </div>
        </div>

        <h4>الأصناف</h4>
        <p-table [value]="order.items" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 35%">الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الخصم %</th>
              <th>الإجمالي</th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item let-i="rowIndex">
            <tr>
              <td>
                <p-select [options]="items" [(ngModel)]="item.itemId" 
                          optionLabel="name" optionValue="id" placeholder="اختر الصنف"
                          [filter]="true" filterBy="name,code"></p-select>
              </td>
              <td>
                <p-inputnumber [(ngModel)]="item.quantity" [min]="1" (onInput)="calculateItemTotal(i)"></p-inputnumber>
              </td>
              <td>
                <p-inputnumber [(ngModel)]="item.unitPrice" [min]="0" mode="decimal" 
                               [minFractionDigits]="2" (onInput)="calculateItemTotal(i)"></p-inputnumber>
              </td>
              <td>
                <p-inputnumber [(ngModel)]="item.discountPercent" [min]="0" [max]="100" 
                               (onInput)="calculateItemTotal(i)"></p-inputnumber>
              </td>
              <td>{{ calculateItemTotalValue(item) | number:'1.2-2' }}</td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                        (click)="removeItem(i)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
        <button pButton label="إضافة صنف" icon="pi pi-plus" class="p-button-text mt-2" 
                (click)="addItem()"></button>

        <div class="totals-section">
          <div class="total-row">
            <span>المجموع الفرعي:</span>
            <span>{{ calculateSubtotal() | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row">
            <span>الضريبة (15%):</span>
            <span>{{ calculateTax() | number:'1.2-2' }} ر.س</span>
          </div>
          <div class="total-row grand">
            <span>الإجمالي:</span>
            <span>{{ calculateGrandTotal() | number:'1.2-2' }} ر.س</span>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveOrder()"></button>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="viewDialog" header="تفاصيل أمر الشراء" [modal]="true" [style]="{width: '800px'}">
      <ng-template pTemplate="content" *ngIf="selectedOrder">
        <div class="status-steps">
          <div *ngFor="let step of orderSteps; let i = index" 
               [class]="'step ' + (i <= getOrderStepIndex(selectedOrder.status) ? 'active' : '')">
            <span class="step-number">{{ i + 1 }}</span>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
        
        <div class="detail-grid mt-4">
          <div><strong>رقم الأمر:</strong> {{ selectedOrder.orderNo }}</div>
          <div><strong>المورد:</strong> {{ selectedOrder.supplier?.name }}</div>
          <div><strong>تاريخ الأمر:</strong> {{ selectedOrder.orderDate | date:'yyyy-MM-dd' }}</div>
          <div><strong>تاريخ التسليم:</strong> {{ selectedOrder.expectedDate | date:'yyyy-MM-dd' }}</div>
          <div><strong>الحالة:</strong> {{ getStatusLabel(selectedOrder.status) }}</div>
          <div><strong>تم الاعتماد بواسطة:</strong> {{ selectedOrder.approvedBy || '-' }}</div>
        </div>

        <h4>الأصناف</h4>
        <p-table [value]="selectedOrder.items" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>الكود</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الخصم</th>
              <th>الإجمالي</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.item?.code }}</td>
              <td>{{ item.item?.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unitPrice | number:'1.2-2' }}</td>
              <td>{{ item.discountPercent }}%</td>
              <td>{{ item.totalPrice | number:'1.2-2' }}</td>
            </tr>
          </ng-template>
        </p-table>

        <div class="totals-section">
          <div class="total-row"><span>المجموع الفرعي:</span><span>{{ selectedOrder.subtotal | number:'1.2-2' }} ر.س</span></div>
          <div class="total-row"><span>الضريبة:</span><span>{{ selectedOrder.taxAmount | number:'1.2-2' }} ر.س</span></div>
          <div class="total-row"><span>الخصم:</span><span>{{ selectedOrder.discountAmount | number:'1.2-2' }} ر.س</span></div>
          <div class="total-row grand"><span>الإجمالي:</span><span>{{ selectedOrder.totalAmount | number:'1.2-2' }} ر.س</span></div>
        </div>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="receiveDialog" header="استلام البضاعة" [modal]="true" [style]="{width: '400px'}">
      <ng-template pTemplate="content">
        <div class="field">
          <label>المستودع *</label>
          <p-select [options]="warehouses" [(ngModel)]="receiveWarehouseId" 
                    optionLabel="name" optionValue="id" placeholder="اختر المستودع"></p-select>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="receiveDialog = false"></button>
        <button pButton label="استلام" icon="pi pi-check" (click)="receiveOrder()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container { padding: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .text-center { text-align: center; padding: 2rem; color: #64748b; }
    h2 { margin: 0; color: #1e3a5f; }
    h4 { margin: 1.5rem 0 1rem; color: #1e3a5f; }
    .grid { display: flex; flex-wrap: wrap; margin: -0.5rem; }
    .col-4 { width: 33.33%; padding: 0.5rem; box-sizing: border-box; }
    .col-12 { width: 100%; padding: 0.5rem; box-sizing: border-box; }
    .totals-section { margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
    .total-row { display: flex; justify-content: space-between; padding: 0.5rem 0; }
    .total-row.grand { font-weight: bold; font-size: 1.1rem; border-top: 2px solid #dee2e6; margin-top: 0.5rem; padding-top: 1rem; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1.5rem; }
    .status-steps { display: flex; justify-content: space-between; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
    .step { display: flex; flex-direction: column; align-items: center; opacity: 0.5; }
    .step.active { opacity: 1; }
    .step-number { width: 30px; height: 30px; border-radius: 50%; background: #dee2e6; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; }
    .step.active .step-number { background: #22c55e; color: white; }
    .step-label { font-size: 0.75rem; }
  `]
})
export class PurchaseOrdersComponent implements OnInit {
  orders: any[] = [];
  suppliers: any[] = [];
  items: any[] = [];
  warehouses: any[] = [];
  order: any = { items: [] };
  selectedOrder: any = null;
  orderDialog = false;
  viewDialog = false;
  receiveDialog = false;
  editMode = false;
  loading = false;
  receiveWarehouseId = '';
  orderToReceive: any = null;

  orderSteps = [
    { label: 'مسودة' },
    { label: 'انتظار الموافقة' },
    { label: 'معتمد' },
    { label: 'مرسل للمورد' },
    { label: 'مستلم' }
  ];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.loadSuppliers();
    this.loadItems();
    this.loadWarehouses();
  }

  loadOrders() {
    this.loading = true;
    this.api.getPurchaseOrders({ take: 100 }).subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل أوامر الشراء' });
      }
    });
  }

  loadSuppliers() {
    this.api.getSuppliers({ take: 100, isActive: true }).subscribe({
      next: (res) => this.suppliers = res.data
    });
  }

  loadItems() {
    this.api.getItems({ take: 500, isActive: true }).subscribe({
      next: (res) => this.items = res.data
    });
  }

  loadWarehouses() {
    this.api.getWarehouses({ take: 100, isActive: true }).subscribe({
      next: (res) => this.warehouses = res.data
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = { draft: 'مسودة', pending: 'انتظار الموافقة', approved: 'معتمد', sent: 'مرسل', received: 'مستلم', cancelled: 'ملغي' };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { draft: 'secondary', pending: 'warn', approved: 'info', sent: 'info', received: 'success', cancelled: 'danger' };
    return severities[status] || 'info';
  }

  getOrderStepIndex(status: string): number {
    const indices: any = { draft: 0, pending: 1, approved: 2, sent: 3, received: 4 };
    return indices[status] || 0;
  }

  openNew() {
    this.order = { 
      orderDate: new Date(), 
      items: [{ itemId: '', quantity: 1, unitPrice: 0, discountPercent: 0 }],
      createdBy: 'admin'
    };
    this.editMode = false;
    this.orderDialog = true;
  }

  editOrder(order: any) {
    this.order = { ...order, items: order.items.map((i: any) => ({ ...i })) };
    this.editMode = true;
    this.orderDialog = true;
  }

  viewOrder(order: any) {
    this.selectedOrder = order;
    this.viewDialog = true;
  }

  addItem() {
    this.order.items.push({ itemId: '', quantity: 1, unitPrice: 0, discountPercent: 0 });
  }

  removeItem(index: number) {
    this.order.items.splice(index, 1);
  }

  calculateItemTotal(index: number) {}

  calculateItemTotalValue(item: any): number {
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
    const discount = subtotal * ((item.discountPercent || 0) / 100);
    return subtotal - discount;
  }

  calculateSubtotal(): number {
    return this.order.items.reduce((sum: number, item: any) => sum + this.calculateItemTotalValue(item), 0);
  }

  calculateTax(): number {
    return this.calculateSubtotal() * 0.15;
  }

  calculateGrandTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  hideDialog() {
    this.orderDialog = false;
  }

  saveOrder() {
    if (!this.order.supplierId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار المورد' });
      return;
    }

    const validItems = this.order.items.filter((i: any) => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى إضافة صنف واحد على الأقل' });
      return;
    }

    const data = { ...this.order, items: validItems };
    const action = this.editMode
      ? this.api.updatePurchaseOrder(this.order.id, data)
      : this.api.createPurchaseOrder(data);

    action.subscribe({
      next: () => {
        this.loadOrders();
        this.hideDialog();
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: this.editMode ? 'تم تحديث الأمر' : 'تم إنشاء الأمر' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ الأمر' });
      }
    });
  }

  submitOrder(order: any) {
    this.api.updatePurchaseOrder(order.id, { status: 'pending' }).subscribe({
      next: () => {
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إرسال الأمر للموافقة' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل إرسال الأمر' });
      }
    });
  }

  approveOrder(order: any) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من اعتماد هذا الأمر؟',
      header: 'اعتماد أمر الشراء',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.approvePurchaseOrder(order.id, 'admin').subscribe({
          next: () => {
            this.loadOrders();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اعتماد الأمر' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل اعتماد الأمر' });
          }
        });
      }
    });
  }

  sendOrder(order: any) {
    this.api.sendPurchaseOrder(order.id).subscribe({
      next: () => {
        this.loadOrders();
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إرسال الأمر للمورد' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل إرسال الأمر' });
      }
    });
  }

  openReceiveDialog(order: any) {
    this.orderToReceive = order;
    this.receiveWarehouseId = '';
    this.receiveDialog = true;
  }

  receiveOrder() {
    if (!this.receiveWarehouseId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار المستودع' });
      return;
    }

    this.api.receivePurchaseOrder(this.orderToReceive.id, this.receiveWarehouseId, 'admin').subscribe({
      next: () => {
        this.loadOrders();
        this.receiveDialog = false;
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم استلام البضاعة وتحديث المخزون' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل استلام البضاعة' });
      }
    });
  }
}
