import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, PanelMenuModule, DrawerModule, ButtonModule],
  template: `
    <div class="layout-wrapper">
      <aside class="layout-sidebar">
        <div class="logo">
          <i class="pi pi-box"></i>
          <span>نظام المخزون</span>
        </div>
        <div class="menu-container">
          <p-panelMenu [model]="menuItems" styleClass="layout-menu"></p-panelMenu>
        </div>
      </aside>
      
      <div class="layout-main">
        <header class="topbar">
          <div class="topbar-start">
            <span class="welcome-text">مرحباً بك في نظام إدارة المخزون</span>
          </div>
          <div class="topbar-end">
            <p-button icon="pi pi-user" styleClass="p-button-rounded p-button-text"></p-button>
          </div>
        </header>
        
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .layout-sidebar {
      width: 280px;
      background: #1e3a5f;
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0; /* RTL support */
      z-index: 1000;
      box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    }

    .layout-main {
      flex: 1;
      margin-right: 280px; /* RTL support */
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .logo {
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: bold;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.1);
    }

    .logo i {
      font-size: 1.75rem;
      color: #60a5fa;
    }

    .menu-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .topbar {
      height: 70px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .welcome-text {
      color: #475569;
      font-weight: 500;
    }

    .layout-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    /* PrimeNG Menu Customization */
    :host ::ng-deep {
      .p-panelmenu {
        width: 100%;
      }
      
      .p-panelmenu .p-panelmenu-header-action {
        background: transparent;
        color: #e2e8f0;
        border: none;
        border-radius: 0;
        padding: 1rem 1.5rem;
        font-weight: 500;
        transition: all 0.2s;
      }

      .p-panelmenu .p-panelmenu-header-action:hover {
        background: rgba(255,255,255,0.05);
        color: white;
      }

      .p-panelmenu .p-panelmenu-header-action:focus {
        box-shadow: none;
      }

      .p-panelmenu .p-panelmenu-content {
        background: rgba(0,0,0,0.1);
        border: none;
        padding: 0;
      }

      .p-panelmenu .p-menuitem-link {
        padding: 0.75rem 2rem 0.75rem 1.5rem;
        color: #cbd5e1;
      }

      .p-panelmenu .p-menuitem-link:hover {
        background: rgba(255,255,255,0.05);
        color: white;
      }

      .p-panelmenu .p-menuitem-icon {
        color: #94a3b8;
        margin-left: 0.5rem;
        margin-right: 0;
      }

      .p-panelmenu .p-panelmenu-header-action .p-icon {
        order: -1;
        margin-right: auto;
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  menuItems: MenuItem[] = [
    { 
      label: 'لوحة التحكم', 
      icon: 'pi pi-home', 
      routerLink: '/dashboard' 
    },
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
    { 
      label: 'الموردين', 
      icon: 'pi pi-users', 
      routerLink: '/suppliers' 
    },
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
