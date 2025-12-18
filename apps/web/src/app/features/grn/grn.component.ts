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

interface GrnItem {
  itemId: string;
  itemName?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitId: string;
  unitName?: string;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: Date;
  inspectionStatus: string;
  rejectionReason?: string;
  notes?: string;
}

interface Grn {
  id?: string;
  grnNumber?: string;
  grnDate: Date;
  supplierId: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName?: string;
  deliveryNoteNumber?: string;
  invoiceNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  notes?: string;
  status: string;
  items: GrnItem[];
}

@Component({
  selector: 'app-grn',
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
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon" style="background: linear-gradient(135deg, #10b981, #059669)">
            <i class="pi pi-inbox"></i>
          </div>
          <div class="header-text">
            <h1>سندات استلام البضائع</h1>
            <p>إدارة سندات استلام البضائع من الموردين (GRN)</p>
          </div>
        </div>
        <button pButton label="سند استلام جديد" icon="pi pi-plus" 
                class="p-button-primary" (click)="openNew()"></button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8)">
            <i class="pi pi-file"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.total }}</span>
            <span class="stat-label">إجمالي السندات</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706)">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.draft }}</span>
            <span class="stat-label">مسودة</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669)">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.accepted }}</span>
            <span class="stat-label">معتمد</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626)">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.rejected }}</span>
            <span class="stat-label">مرفوض</span>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input pInputText type="text" [(ngModel)]="searchTerm" 
                 (input)="onSearch($event)" placeholder="بحث في سندات الاستلام..." 
                 class="search-input" />
        </p-iconfield>
        <div class="filter-info">
          <span class="total-count">{{ grns.length }} سند</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <p-table [value]="filteredGrns" [paginator]="true" [rows]="10" 
                 [loading]="loading" [rowHover]="true"
                 [showCurrentPageReport]="true" 
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords}"
                 styleClass="p-datatable-sm modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 120px">رقم السند</th>
              <th style="width: 100px">التاريخ</th>
              <th style="width: 180px">المورد</th>
              <th style="width: 150px">المستودع</th>
              <th style="width: 100px" class="text-center">البنود</th>
              <th style="width: 100px" class="text-center">الحالة</th>
              <th style="width: 120px" class="text-center">إجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-grn>
            <tr>
              <td><span class="code-badge">{{ grn.grnNumber }}</span></td>
              <td>{{ grn.grnDate | date:'yyyy-MM-dd' }}</td>
              <td>
                <div class="name-cell">
                  <span class="name-primary">{{ grn.supplier?.name }}</span>
                  <span class="name-desc">{{ grn.supplier?.code }}</span>
                </div>
              </td>
              <td>{{ grn.warehouse?.name }}</td>
              <td class="text-center">
                <span class="count-badge">{{ grn.items?.length || 0 }}</span>
              </td>
              <td class="text-center">
                <p-tag [severity]="getStatusSeverity(grn.status)" 
                       [value]="getStatusLabel(grn.status)"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                          (click)="viewGrn(grn)" pTooltip="عرض"></button>
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                          (click)="editGrn(grn)" [disabled]="grn.status !== 'draft'"
                          pTooltip="تعديل"></button>
                  <button pButton icon="pi pi-check" class="p-button-text p-button-success p-button-sm"
                          (click)="approveGrn(grn)" [disabled]="grn.status !== 'draft'"
                          pTooltip="اعتماد"></button>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm"
                          (click)="deleteGrn(grn)" [disabled]="grn.status !== 'draft'"
                          pTooltip="حذف"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center p-4">
                <div class="empty-state">
                  <i class="pi pi-inbox" style="font-size: 3rem; color: #ccc;"></i>
                  <p>لا توجد سندات استلام</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- GRN Dialog -->
    <p-dialog [(visible)]="grnDialog" [style]="{width: '900px'}" 
              [header]="editMode ? 'تعديل سند الاستلام' : 'سند استلام جديد'" 
              [modal]="true" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="form-grid">
          <!-- Row 1 -->
          <div class="form-row">
            <div class="form-group">
              <label>المورد *</label>
              <p-select [options]="suppliers" [(ngModel)]="grn.supplierId" 
                        optionLabel="name" optionValue="id" 
                        placeholder="اختر المورد" [filter]="true"></p-select>
            </div>
            <div class="form-group">
              <label>المستودع *</label>
              <p-select [options]="warehouses" [(ngModel)]="grn.warehouseId" 
                        optionLabel="name" optionValue="id" 
                        placeholder="اختر المستودع" [filter]="true"></p-select>
            </div>
            <div class="form-group">
              <label>تاريخ الاستلام</label>
              <p-datepicker [(ngModel)]="grn.grnDate" dateFormat="yy-mm-dd" 
                          [showIcon]="true"></p-datepicker>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="form-row">
            <div class="form-group">
              <label>رقم إشعار التسليم</label>
              <input pInputText [(ngModel)]="grn.deliveryNoteNumber" />
            </div>
            <div class="form-group">
              <label>رقم الفاتورة</label>
              <input pInputText [(ngModel)]="grn.invoiceNumber" />
            </div>
            <div class="form-group">
              <label>رقم المركبة</label>
              <input pInputText [(ngModel)]="grn.vehicleNumber" />
            </div>
          </div>

          <!-- Row 3 -->
          <div class="form-row">
            <div class="form-group">
              <label>اسم السائق</label>
              <input pInputText [(ngModel)]="grn.driverName" />
            </div>
            <div class="form-group" style="grid-column: span 2">
              <label>ملاحظات</label>
              <textarea pTextarea [(ngModel)]="grn.notes" rows="2"></textarea>
            </div>
          </div>

          <!-- Items Section -->
          <div class="items-section">
            <div class="items-header">
              <h3>بنود الاستلام</h3>
              <button pButton label="إضافة بند" icon="pi pi-plus" 
                      class="p-button-sm" (click)="addItem()"></button>
            </div>
            
            <p-table [value]="grn.items" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 200px">الصنف</th>
                  <th style="width: 100px">الوحدة</th>
                  <th style="width: 80px">المطلوب</th>
                  <th style="width: 80px">المستلم</th>
                  <th style="width: 80px">المقبول</th>
                  <th style="width: 80px">المرفوض</th>
                  <th style="width: 80px">السعر</th>
                  <th style="width: 60px"></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr>
                  <td>
                    <p-select [options]="items" [(ngModel)]="item.itemId" 
                              optionLabel="name" optionValue="id" 
                              placeholder="اختر الصنف" [filter]="true"
                              (onChange)="onItemSelect($event, i)"></p-select>
                  </td>
                  <td>
                    <p-select [options]="units" [(ngModel)]="item.unitId" 
                              optionLabel="name" optionValue="id"></p-select>
                  </td>
                  <td>
                    <p-inputnumber [(ngModel)]="item.orderedQuantity" 
                                   [min]="0" mode="decimal"></p-inputnumber>
                  </td>
                  <td>
                    <p-inputnumber [(ngModel)]="item.receivedQuantity" 
                                   [min]="0" mode="decimal"
                                   (onInput)="updateAccepted(item)"></p-inputnumber>
                  </td>
                  <td>
                    <p-inputnumber [(ngModel)]="item.acceptedQuantity" 
                                   [min]="0" mode="decimal"></p-inputnumber>
                  </td>
                  <td>
                    <p-inputnumber [(ngModel)]="item.rejectedQuantity" 
                                   [min]="0" mode="decimal"></p-inputnumber>
                  </td>
                  <td>
                    <p-inputnumber [(ngModel)]="item.unitCost" 
                                   [min]="0" mode="decimal"></p-inputnumber>
                  </td>
                  <td>
                    <button pButton icon="pi pi-trash" 
                            class="p-button-text p-button-danger p-button-sm"
                            (click)="removeItem(i)"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center p-3">
                    لم يتم إضافة بنود بعد
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" 
                class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" 
                class="p-button-primary" (click)="saveGrn()"
                [disabled]="!isFormValid()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    ${PAGE_STYLES}
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .form-group label {
      font-weight: 500;
      color: #374151;
    }
    
    .items-section {
      margin-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }
    
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .items-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 0.25rem;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      color: #9ca3af;
    }
  `]
})
export class GrnComponent implements OnInit {
  grns: any[] = [];
  filteredGrns: any[] = [];
  suppliers: any[] = [];
  warehouses: any[] = [];
  items: any[] = [];
  units: any[] = [];
  
  grn: Grn = this.getEmptyGrn();
  grnDialog = false;
  editMode = false;
  loading = false;
  searchTerm = '';
  
  stats = { total: 0, draft: 0, accepted: 0, rejected: 0 };

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadGrns();
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadItems();
    this.loadUnits();
    this.loadStats();
  }

  getEmptyGrn(): Grn {
    return {
      grnDate: new Date(),
      supplierId: '',
      warehouseId: '',
      deliveryNoteNumber: '',
      invoiceNumber: '',
      vehicleNumber: '',
      driverName: '',
      notes: '',
      status: 'draft',
      items: []
    };
  }

  loadGrns() {
    this.loading = true;
    this.api.get('grn').subscribe({
      next: (res: any) => {
        this.grns = res.data || [];
        this.filteredGrns = [...this.grns];
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل سندات الاستلام' });
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.api.get('grn/stats').subscribe({
      next: (res: any) => {
        this.stats = res;
      }
    });
  }

  loadSuppliers() {
    this.api.get('suppliers').subscribe({
      next: (res: any) => this.suppliers = res.data || res || []
    });
  }

  loadWarehouses() {
    this.api.get('warehouses').subscribe({
      next: (res: any) => this.warehouses = res.data || res || []
    });
  }

  loadItems() {
    this.api.get('items').subscribe({
      next: (res: any) => this.items = res.data || res || []
    });
  }

  loadUnits() {
    this.api.get('units').subscribe({
      next: (res: any) => this.units = res.data || res || []
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredGrns = this.grns.filter(g => 
      g.grnNumber?.toLowerCase().includes(term) ||
      g.supplier?.name?.toLowerCase().includes(term) ||
      g.warehouse?.name?.toLowerCase().includes(term)
    );
  }

  openNew() {
    this.grn = this.getEmptyGrn();
    this.editMode = false;
    this.grnDialog = true;
  }

  editGrn(grn: any) {
    this.grn = {
      ...grn,
      grnDate: new Date(grn.grnDate),
      items: grn.items.map((item: any) => ({
        itemId: item.itemId,
        unitId: item.unitId,
        orderedQuantity: Number(item.orderedQuantity),
        receivedQuantity: Number(item.receivedQuantity),
        acceptedQuantity: Number(item.acceptedQuantity),
        rejectedQuantity: Number(item.rejectedQuantity),
        unitCost: Number(item.unitCost),
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
        inspectionStatus: item.inspectionStatus,
        rejectionReason: item.rejectionReason,
        notes: item.notes
      }))
    };
    this.editMode = true;
    this.grnDialog = true;
  }

  viewGrn(grn: any) {
    this.editGrn(grn);
  }

  hideDialog() {
    this.grnDialog = false;
  }

  addItem() {
    this.grn.items.push({
      itemId: '',
      orderedQuantity: 0,
      receivedQuantity: 0,
      acceptedQuantity: 0,
      rejectedQuantity: 0,
      unitId: '',
      unitCost: 0,
      inspectionStatus: 'pending'
    });
  }

  removeItem(index: number) {
    this.grn.items.splice(index, 1);
  }

  onItemSelect(event: any, index: number) {
    const item = this.items.find(i => i.id === event.value);
    if (item) {
      this.grn.items[index].unitId = item.unitId;
    }
  }

  updateAccepted(item: GrnItem) {
    item.acceptedQuantity = item.receivedQuantity;
    item.rejectedQuantity = 0;
  }

  isFormValid(): boolean {
    return !!this.grn.supplierId && !!this.grn.warehouseId && this.grn.items.length > 0;
  }

  saveGrn() {
    const payload = {
      ...this.grn,
      grnDate: this.grn.grnDate.toISOString()
    };

    if (this.editMode && this.grn.id) {
      this.api.patch(`grn/${this.grn.id}`, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تحديث سند الاستلام' });
          this.loadGrns();
          this.loadStats();
          this.hideDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحديث سند الاستلام' });
        }
      });
    } else {
      this.api.post('grn', payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إنشاء سند الاستلام' });
          this.loadGrns();
          this.loadStats();
          this.hideDialog();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إنشاء سند الاستلام' });
        }
      });
    }
  }

  approveGrn(grn: any) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من اعتماد سند الاستلام؟ سيتم تحديث أرصدة المخزون.',
      header: 'تأكيد الاعتماد',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.api.post(`grn/${grn.id}/approve`, {}).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اعتماد سند الاستلام' });
            this.loadGrns();
            this.loadStats();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل اعتماد سند الاستلام' });
          }
        });
      }
    });
  }

  deleteGrn(grn: any) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف سند الاستلام؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.delete(`grn/${grn.id}`).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف سند الاستلام' });
            this.loadGrns();
            this.loadStats();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل حذف سند الاستلام' });
          }
        });
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: any = {
      'draft': 'warn',
      'inspected': 'info',
      'accepted': 'success',
      'rejected': 'danger',
      'partial': 'secondary'
    };
    return map[status] || 'info';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'draft': 'مسودة',
      'inspected': 'تم الفحص',
      'accepted': 'معتمد',
      'rejected': 'مرفوض',
      'partial': 'جزئي'
    };
    return map[status] || status;
  }
}
