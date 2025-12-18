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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, InputNumber, Select, DatePicker, Toast, ConfirmDialog, Toolbar, Tag
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>حركات المخزون</h2>
        </ng-template>
        <ng-template #end>
          <p-select [options]="movementTypes" [(ngModel)]="selectedType" 
                    optionLabel="label" optionValue="value" placeholder="نوع الحركة"
                    (onChange)="openNew($event.value)" styleClass="mr-2"></p-select>
        </ng-template>
      </p-toolbar>

      <p-table [value]="movements" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="movementNo">رقم الحركة</th>
            <th>النوع</th>
            <th>من مستودع</th>
            <th>إلى مستودع</th>
            <th>التاريخ</th>
            <th>عدد الأصناف</th>
            <th>الإجمالي</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-movement>
          <tr>
            <td>{{ movement.movementNo }}</td>
            <td>
              <p-tag [value]="getTypeLabel(movement.type)" [severity]="getTypeSeverity(movement.type)"></p-tag>
            </td>
            <td>{{ movement.fromWarehouse?.name || '-' }}</td>
            <td>{{ movement.toWarehouse?.name || '-' }}</td>
            <td>{{ movement.movementDate | date:'yyyy-MM-dd' }}</td>
            <td>{{ movement.items?.length || 0 }}</td>
            <td>{{ movement.totalAmount | number:'1.2-2' }}</td>
            <td>
              <p-tag [value]="getStatusLabel(movement.status)" [severity]="getStatusSeverity(movement.status)"></p-tag>
            </td>
            <td>
              <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text" 
                      (click)="viewMovement(movement)" pTooltip="عرض"></button>
              <button *ngIf="movement.status === 'draft'" pButton icon="pi pi-check" 
                      class="p-button-rounded p-button-text p-button-success" 
                      (click)="confirmMovement(movement)" pTooltip="تأكيد"></button>
              <button *ngIf="movement.status === 'draft'" pButton icon="pi pi-times" 
                      class="p-button-rounded p-button-text p-button-danger" 
                      (click)="cancelMovement(movement)" pTooltip="إلغاء"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="9" class="text-center">لا توجد حركات</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="movementDialog" [header]="getDialogHeader()" 
              [modal]="true" [style]="{width: '800px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="grid">
          <div class="col-4" *ngIf="movement.type === 'issue' || movement.type === 'transfer'">
            <div class="field">
              <label>من مستودع *</label>
              <p-select [options]="warehouses" [(ngModel)]="movement.fromWarehouseId" 
                        optionLabel="name" optionValue="id" placeholder="اختر المستودع"></p-select>
            </div>
          </div>
          <div class="col-4" *ngIf="movement.type === 'receipt' || movement.type === 'transfer'">
            <div class="field">
              <label>إلى مستودع *</label>
              <p-select [options]="warehouses" [(ngModel)]="movement.toWarehouseId" 
                        optionLabel="name" optionValue="id" placeholder="اختر المستودع"></p-select>
            </div>
          </div>
          <div class="col-4">
            <div class="field">
              <label>التاريخ</label>
              <p-datepicker [(ngModel)]="movement.movementDate" dateFormat="yy-mm-dd"></p-datepicker>
            </div>
          </div>
          <div class="col-12">
            <div class="field">
              <label>ملاحظات</label>
              <input pInputText [(ngModel)]="movement.notes" />
            </div>
          </div>
        </div>

        <h4>الأصناف</h4>
        <p-table [value]="movement.items" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 40%">الصنف</th>
              <th>الكمية</th>
              <th>التكلفة</th>
              <th>الإجمالي</th>
              <th style="width: 60px"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item let-i="rowIndex">
            <tr>
              <td>
                <p-select [options]="items" [(ngModel)]="item.itemId" 
                          optionLabel="name" optionValue="id" placeholder="اختر الصنف"
                          [filter]="true" filterBy="name,code" (onChange)="onItemSelect($event, i)"></p-select>
              </td>
              <td>
                <p-inputnumber [(ngModel)]="item.quantity" [min]="1" (onInput)="calculateTotal(i)"></p-inputnumber>
              </td>
              <td>
                <p-inputnumber [(ngModel)]="item.unitCost" [min]="0" mode="decimal" 
                               [minFractionDigits]="2" (onInput)="calculateTotal(i)"></p-inputnumber>
              </td>
              <td>{{ (item.quantity || 0) * (item.unitCost || 0) | number:'1.2-2' }}</td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                        (click)="removeItem(i)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
        <button pButton label="إضافة صنف" icon="pi pi-plus" class="p-button-text mt-2" 
                (click)="addItem()"></button>
        
        <div class="total-section">
          <strong>الإجمالي: {{ calculateGrandTotal() | number:'1.2-2' }} ر.س</strong>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveMovement()"></button>
      </ng-template>
    </p-dialog>

    <p-dialog [(visible)]="viewDialog" header="تفاصيل الحركة" [modal]="true" [style]="{width: '700px'}">
      <ng-template pTemplate="content" *ngIf="selectedMovement">
        <div class="detail-grid">
          <div><strong>رقم الحركة:</strong> {{ selectedMovement.movementNo }}</div>
          <div><strong>النوع:</strong> {{ getTypeLabel(selectedMovement.type) }}</div>
          <div><strong>من مستودع:</strong> {{ selectedMovement.fromWarehouse?.name || '-' }}</div>
          <div><strong>إلى مستودع:</strong> {{ selectedMovement.toWarehouse?.name || '-' }}</div>
          <div><strong>التاريخ:</strong> {{ selectedMovement.movementDate | date:'yyyy-MM-dd' }}</div>
          <div><strong>الحالة:</strong> {{ getStatusLabel(selectedMovement.status) }}</div>
        </div>
        <h4>الأصناف</h4>
        <p-table [value]="selectedMovement.items" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>الكود</th>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>التكلفة</th>
              <th>الإجمالي</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.item?.code }}</td>
              <td>{{ item.item?.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.unitCost | number:'1.2-2' }}</td>
              <td>{{ item.totalCost | number:'1.2-2' }}</td>
            </tr>
          </ng-template>
        </p-table>
        <div class="total-section">
          <strong>الإجمالي: {{ selectedMovement.totalAmount | number:'1.2-2' }} ر.س</strong>
        </div>
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
    .total-section { text-align: left; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 4px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem; }
    .mr-2 { margin-right: 0.5rem; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class MovementsComponent implements OnInit {
  movements: any[] = [];
  warehouses: any[] = [];
  items: any[] = [];
  movement: any = { items: [] };
  selectedMovement: any = null;
  movementDialog = false;
  viewDialog = false;
  loading = false;
  selectedType = '';

  movementTypes = [
    { label: 'استلام', value: 'receipt' },
    { label: 'صرف', value: 'issue' },
    { label: 'تحويل', value: 'transfer' },
    { label: 'تسوية', value: 'adjustment' }
  ];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadMovements();
    this.loadWarehouses();
    this.loadItems();
  }

  loadMovements() {
    this.loading = true;
    this.api.getMovements({ take: 100 }).subscribe({
      next: (res) => {
        this.movements = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل الحركات' });
      }
    });
  }

  loadWarehouses() {
    this.api.getWarehouses({ take: 100, isActive: true }).subscribe({
      next: (res) => this.warehouses = res.data
    });
  }

  loadItems() {
    this.api.getItems({ take: 500, isActive: true }).subscribe({
      next: (res) => this.items = res.data
    });
  }

  getTypeLabel(type: string): string {
    const labels: any = { receipt: 'استلام', issue: 'صرف', transfer: 'تحويل', adjustment: 'تسوية' };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { receipt: 'success', issue: 'danger', transfer: 'info', adjustment: 'warn' };
    return severities[type] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: any = { draft: 'مسودة', confirmed: 'مؤكد', cancelled: 'ملغي' };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: any = { draft: 'warn', confirmed: 'success', cancelled: 'danger' };
    return severities[status] || 'info';
  }

  getDialogHeader(): string {
    const labels: any = { receipt: 'حركة استلام', issue: 'حركة صرف', transfer: 'حركة تحويل', adjustment: 'تسوية' };
    return labels[this.movement.type] || 'حركة جديدة';
  }

  openNew(type: string) {
    this.movement = { 
      type, 
      movementDate: new Date(), 
      items: [{ itemId: '', quantity: 1, unitCost: 0 }],
      createdBy: 'admin'
    };
    this.selectedType = '';
    this.movementDialog = true;
  }

  viewMovement(movement: any) {
    this.selectedMovement = movement;
    this.viewDialog = true;
  }

  addItem() {
    this.movement.items.push({ itemId: '', quantity: 1, unitCost: 0 });
  }

  removeItem(index: number) {
    this.movement.items.splice(index, 1);
  }

  onItemSelect(event: any, index: number) {
    const item = this.items.find(i => i.id === event.value);
    if (item) {
      this.movement.items[index].unitCost = Number(item.avgCost) || 0;
    }
  }

  calculateTotal(index: number) {
    const item = this.movement.items[index];
    item.totalCost = (item.quantity || 0) * (item.unitCost || 0);
  }

  calculateGrandTotal(): number {
    return this.movement.items.reduce((sum: number, item: any) => 
      sum + ((item.quantity || 0) * (item.unitCost || 0)), 0);
  }

  hideDialog() {
    this.movementDialog = false;
  }

  saveMovement() {
    const validItems = this.movement.items.filter((i: any) => i.itemId && i.quantity > 0);
    if (validItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى إضافة صنف واحد على الأقل' });
      return;
    }

    const data = { ...this.movement, items: validItems };

    this.api.createMovement(data).subscribe({
      next: () => {
        this.loadMovements();
        this.hideDialog();
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء الحركة' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل إنشاء الحركة' });
      }
    });
  }

  confirmMovement(movement: any) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من تأكيد هذه الحركة؟ سيتم تحديث المخزون.',
      header: 'تأكيد الحركة',
      icon: 'pi pi-check',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.confirmMovement(movement.id, 'admin').subscribe({
          next: () => {
            this.loadMovements();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تأكيد الحركة' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل تأكيد الحركة' });
          }
        });
      }
    });
  }

  cancelMovement(movement: any) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من إلغاء هذه الحركة؟',
      header: 'إلغاء الحركة',
      icon: 'pi pi-times',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.cancelMovement(movement.id).subscribe({
          next: () => {
            this.loadMovements();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إلغاء الحركة' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل إلغاء الحركة' });
          }
        });
      }
    });
  }
}
