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
import { Tag } from 'primeng/tag';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';
import { PAGE_STYLES } from '../../shared/styles/page-styles';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, Dialog,
    InputText, ToggleSwitch, Toast, ConfirmDialog, Tag, InputIcon, IconField
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmdialog></p-confirmdialog>
    
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-icon" style="background: linear-gradient(135deg, #14b8a6, #0d9488)">
            <i class="pi pi-sliders-h"></i>
          </div>
          <div class="header-text">
            <h1>وحدات القياس</h1>
            <p>إدارة وحدات قياس الأصناف والمنتجات</p>
          </div>
        </div>
        <button pButton label="إضافة وحدة" icon="pi pi-plus" 
                class="p-button-primary" (click)="openNew()"></button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="filter-bar">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search"></p-inputicon>
          <input pInputText type="text" [(ngModel)]="searchTerm" 
                 (input)="onSearch($event)" placeholder="بحث في وحدات القياس..." 
                 class="search-input" />
        </p-iconfield>
        <div class="filter-info">
          <span class="total-count">{{ units.length }} وحدة</span>
        </div>
      </div>

      <!-- Data Table -->
      <div class="table-container">
        <p-table [value]="filteredUnits" [paginator]="true" [rows]="10" 
                 [loading]="loading" [rowHover]="true"
                 [showCurrentPageReport]="true" 
                 currentPageReportTemplate="عرض {first} إلى {last} من {totalRecords}"
                 styleClass="p-datatable-sm modern-table">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 100px">الكود</th>
              <th style="width: 180px">الاسم</th>
              <th style="width: 150px">الاسم (إنجليزي)</th>
              <th style="width: 100px" class="text-center">عدد الأصناف</th>
              <th style="width: 80px" class="text-center">الحالة</th>
              <th style="width: 90px" class="text-center">الإجراءات</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-unit>
            <tr>
              <td><span class="code-badge">{{ unit.code }}</span></td>
              <td>
                <div class="name-cell">
                  <span class="name-primary">{{ unit.name }}</span>
                </div>
              </td>
              <td>{{ unit.nameEn || '-' }}</td>
              <td class="text-center">
                <span class="count-badge">{{ unit._count?.items || 0 }}</span>
              </td>
              <td class="text-center">
                <p-tag [severity]="unit.isActive ? 'success' : 'danger'" 
                       [value]="unit.isActive ? 'فعال' : 'معطل'"
                       [rounded]="true" styleClass="text-xs"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button pButton icon="pi pi-pencil" 
                          class="p-button-rounded p-button-text p-button-sm"
                          (click)="editUnit(unit)"></button>
                  <button pButton icon="pi pi-trash" 
                          class="p-button-rounded p-button-text p-button-danger p-button-sm"
                          (click)="deleteUnit(unit)"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-state">
                <div class="empty-content">
                  <i class="pi pi-inbox"></i>
                  <h4>لا توجد وحدات قياس</h4>
                  <p>ابدأ بإضافة وحدة قياس جديدة</p>
                  <button pButton label="إضافة وحدة" icon="pi pi-plus" 
                          class="p-button-outlined" (click)="openNew()"></button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog [(visible)]="unitDialog" [header]="editMode ? 'تعديل وحدة قياس' : 'إضافة وحدة قياس جديدة'" 
              [modal]="true" [style]="{width: '450px'}" styleClass="modern-dialog">
      <ng-template pTemplate="content">
        <div class="form-grid single-column">
          <div class="form-field">
            <label for="code">الكود <span class="required">*</span></label>
            <input pInputText id="code" [(ngModel)]="unit.code" 
                   [disabled]="editMode" placeholder="مثال: PCS" />
            <small class="field-hint" *ngIf="!editMode">الكود فريد ولا يمكن تغييره لاحقاً</small>
          </div>
          
          <div class="form-field">
            <label for="name">الاسم (عربي) <span class="required">*</span></label>
            <input pInputText id="name" [(ngModel)]="unit.name" 
                   placeholder="اسم الوحدة بالعربية" />
          </div>
          
          <div class="form-field">
            <label for="nameEn">الاسم (إنجليزي)</label>
            <input pInputText id="nameEn" [(ngModel)]="unit.nameEn" 
                   placeholder="Unit name in English" dir="ltr" />
          </div>
          
          <div class="form-field-switch">
            <p-toggleswitch [(ngModel)]="unit.isActive"></p-toggleswitch>
            <label>الوحدة فعالة</label>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="إلغاء" icon="pi pi-times" 
                  class="p-button-text" (click)="hideDialog()"></button>
          <button pButton label="حفظ" icon="pi pi-check" 
                  class="p-button-primary" (click)="saveUnit()"
                  [loading]="saving"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [PAGE_STYLES + `
    .name-cell {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .name-primary {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .count-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.625rem;
      border-radius: 1rem;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .form-grid.single-column {
      grid-template-columns: 1fr;
    }

    .form-grid.single-column .form-field-switch {
      grid-column: span 1;
    }
  `]
})
export class UnitsComponent implements OnInit {
  units: any[] = [];
  filteredUnits: any[] = [];
  unit: any = {};
  unitDialog = false;
  editMode = false;
  loading = false;
  saving = false;
  searchTerm = '';

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
        this.filteredUnits = [...this.units];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل وحدات القياس' });
      }
    });
  }

  onSearch(event: any) {
    const term = event.target.value.toLowerCase();
    this.filteredUnits = this.units.filter(u => 
      u.code.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term) ||
      (u.nameEn && u.nameEn.toLowerCase().includes(term))
    );
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
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.api.deleteUnit(unit.id).subscribe({
          next: () => {
            this.loadUnits();
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الوحدة بنجاح' });
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

    this.saving = true;
    const action = this.editMode
      ? this.api.updateUnit(this.unit.id, this.unit)
      : this.api.createUnit(this.unit);

    action.subscribe({
      next: () => {
        this.loadUnits();
        this.hideDialog();
        this.saving = false;
        this.messageService.add({ 
          severity: 'success', 
          summary: 'تم', 
          detail: this.editMode ? 'تم تحديث الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح' 
        });
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err.error?.message || 'فشل حفظ الوحدة' });
      }
    });
  }
}
