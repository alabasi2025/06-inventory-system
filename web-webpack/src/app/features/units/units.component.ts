import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toolbar } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, ToggleSwitch, Toast, ConfirmDialog, Toolbar
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <p-toolbar styleClass="mb-4">
        <ng-template #start>
          <h2>وحدات القياس</h2>
        </ng-template>
        <ng-template #end>
          <button pButton label="إضافة وحدة" icon="pi pi-plus" (click)="openNew()"></button>
        </ng-template>
      </p-toolbar>

      <p-table [value]="units" [paginator]="true" [rows]="10" [loading]="loading" styleClass="p-datatable-striped">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">الكود</th>
            <th pSortableColumn="name">الاسم</th>
            <th>الاسم (إنجليزي)</th>
            <th>عدد الأصناف</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-unit>
          <tr>
            <td>{{ unit.code }}</td>
            <td>{{ unit.name }}</td>
            <td>{{ unit.nameEn || '-' }}</td>
            <td>{{ unit._count?.items || 0 }}</td>
            <td>
              <span [class]="'status-badge ' + (unit.isActive ? 'active' : 'inactive')">
                {{ unit.isActive ? 'فعال' : 'غير فعال' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      (click)="editUnit(unit)"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      (click)="deleteUnit(unit)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">لا توجد وحدات قياس</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="unitDialog" [header]="editMode ? 'تعديل وحدة' : 'إضافة وحدة'" 
              [modal]="true" [style]="{width: '450px'}" styleClass="p-fluid">
      <ng-template pTemplate="content">
        <div class="field">
          <label for="code">الكود *</label>
          <input pInputText id="code" [(ngModel)]="unit.code" required [disabled]="editMode" />
        </div>
        <div class="field">
          <label for="name">الاسم (عربي) *</label>
          <input pInputText id="name" [(ngModel)]="unit.name" required />
        </div>
        <div class="field">
          <label for="nameEn">الاسم (إنجليزي)</label>
          <input pInputText id="nameEn" [(ngModel)]="unit.nameEn" />
        </div>
        <div class="field-checkbox">
          <p-toggleswitch [(ngModel)]="unit.isActive"></p-toggleswitch>
          <label>فعال</label>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="إلغاء" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
        <button pButton label="حفظ" icon="pi pi-check" (click)="saveUnit()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .page-container { padding: 1rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .field-checkbox { display: flex; align-items: center; gap: 0.5rem; }
    .status-badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; }
    .status-badge.active { background: #dcfce7; color: #166534; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    .text-center { text-align: center; padding: 2rem; color: #64748b; }
    h2 { margin: 0; color: #1e3a5f; }
  `]
})
export class UnitsComponent implements OnInit {
  units: any[] = [];
  unit: any = {};
  unitDialog = false;
  editMode = false;
  loading = false;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.loading = true;
    this.api.getUnits({ take: 100 }).subscribe({
      next: (res) => {
        this.units = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل وحدات القياس' });
      }
    });
  }

  openNew() {
    this.unit = { isActive: true };
    this.editMode = false;
    this.unitDialog = true;
  }

  editUnit(unit: any) {
    this.unit = { ...unit };
    this.editMode = true;
    this.unitDialog = true;
  }

  deleteUnit(unit: any) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الوحدة "${unit.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        this.api.deleteUnit(unit.id).subscribe({
          next: () => {
            this.loadUnits();
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم حذف الوحدة' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حذف الوحدة' });
          }
        });
      }
    });
  }

  hideDialog() {
    this.unitDialog = false;
  }

  saveUnit() {
    if (!this.unit.code || !this.unit.name) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى ملء الحقول المطلوبة' });
      return;
    }

    const action = this.editMode
      ? this.api.updateUnit(this.unit.id, this.unit)
      : this.api.createUnit(this.unit);

    action.subscribe({
      next: () => {
        this.loadUnits();
        this.hideDialog();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجاح', 
          detail: this.editMode ? 'تم تحديث الوحدة' : 'تم إضافة الوحدة' 
        });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ الوحدة' });
      }
    });
  }
}
