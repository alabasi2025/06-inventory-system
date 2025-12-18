import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Menubar],
  template: `
    <div class="layout-wrapper">
      <header class="layout-header">
        <p-menubar [model]="menuItems" styleClass="layout-menubar">
          <ng-template pTemplate="start">
            <div class="logo">
              <i class="pi pi-box"></i>
              <span>نظام المخزون</span>
            </div>
          </ng-template>
        </p-menubar>
      </header>
      <main class="layout-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .layout-header {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .layout-menubar {
      border-radius: 0;
      border: none;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
      font-size: 1.25rem;
      font-weight: bold;
      padding: 0 1rem;
    }
    .logo i {
      font-size: 1.5rem;
    }
    .layout-content {
      flex: 1;
      padding: 1.5rem;
      background: #f8f9fa;
    }
    :host ::ng-deep .p-menubar .p-menuitem-link {
      color: white !important;
    }
    :host ::ng-deep .p-menubar .p-menuitem-link:hover {
      background: rgba(255,255,255,0.1) !important;
    }
  `]
})
export class LayoutComponent {
  menuItems: MenuItem[] = [
    { label: 'لوحة التحكم', icon: 'pi pi-home', routerLink: '/dashboard' },
    {
      label: 'البيانات الأساسية',
      icon: 'pi pi-database',
      items: [
        { label: 'التصنيفات', icon: 'pi pi-tags', routerLink: '/categories' },
        { label: 'وحدات القياس', icon: 'pi pi-sliders-h', routerLink: '/units' },
        { label: 'المستودعات', icon: 'pi pi-building', routerLink: '/warehouses' },
        { label: 'الأصناف', icon: 'pi pi-box', routerLink: '/items' },
      ]
    },
    { label: 'الموردين', icon: 'pi pi-users', routerLink: '/suppliers' },
    {
      label: 'العمليات',
      icon: 'pi pi-sync',
      items: [
        { label: 'حركات المخزون', icon: 'pi pi-arrows-h', routerLink: '/movements' },
        { label: 'أوامر الشراء', icon: 'pi pi-shopping-cart', routerLink: '/purchase-orders' },
      ]
    },
  ];
}
