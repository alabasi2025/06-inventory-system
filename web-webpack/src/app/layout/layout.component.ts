import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, PanelMenuModule, DrawerModule, ButtonModule, AvatarModule, BadgeModule],
  template: `
    <div class="layout-wrapper">
      <aside class="layout-sidebar">
        <div class="logo">
          <div class="logo-icon">
            <i class="pi pi-box"></i>
          </div>
          <div class="logo-text">
            <span class="app-name">نظام المخزون</span>
            <span class="app-version">v1.0</span>
          </div>
        </div>
        
        <div class="menu-container">
          <p-panelMenu [model]="menuItems" styleClass="layout-menu"></p-panelMenu>
        </div>

        <div class="user-profile">
          <p-avatar icon="pi pi-user" styleClass="mr-2" shape="circle" [style]="{'background-color': '#3b82f6', 'color': '#ffffff'}"></p-avatar>
          <div class="user-info">
            <span class="user-name">المسؤول</span>
            <span class="user-role">مدير النظام</span>
          </div>
        </div>
      </aside>
      
      <div class="layout-main">
        <header class="topbar">
          <div class="topbar-start">
            <h1 class="page-title">مرحباً بك في نظام إدارة المخزون</h1>
          </div>
          <div class="topbar-end">
            <button pButton icon="pi pi-bell" class="p-button-rounded p-button-text p-button-secondary notification-btn">
              <p-badge value="2" severity="danger"></p-badge>
            </button>
            <button pButton icon="pi pi-cog" class="p-button-rounded p-button-text p-button-secondary"></button>
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
      background-color: var(--surface-ground);
    }

    .layout-sidebar {
      width: 280px;
      background: #ffffff;
      border-left: 1px solid var(--surface-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 1000;
      transition: all 0.3s;
    }

    .layout-main {
      flex: 1;
      margin-right: 280px;
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-right 0.3s;
    }

    .logo {
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      background: #ffffff;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: var(--primary-color);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }

    .logo-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .app-version {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .menu-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 1rem;
    }

    .user-profile {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--surface-border);
      display: flex;
      align-items: center;
      background: #f8fafc;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      margin-right: 0.75rem;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-color);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .topbar {
      height: 80px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      border-bottom: 1px solid var(--surface-border);
      position: sticky;
      top: 0;
      z-index: 999;
    }

    .page-title {
      font-size: 1.25rem;
      margin: 0;
      color: var(--text-color);
    }

    .topbar-end {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .notification-btn {
      position: relative;
    }

    .notification-btn ::ng-deep .p-badge {
      position: absolute;
      top: 0;
      right: 0;
      min-width: 1.25rem;
      height: 1.25rem;
      line-height: 1.25rem;
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
        gap: 0.5rem;
        display: flex;
        flex-direction: column;
      }
      
      .p-panelmenu .p-panelmenu-header-action {
        background: transparent;
        color: var(--text-secondary);
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        font-weight: 600;
        transition: all 0.2s;
        margin-bottom: 0.25rem;
      }

      .p-panelmenu .p-panelmenu-header-action:hover {
        background: #f1f5f9;
        color: var(--primary-color);
      }

      .p-panelmenu .p-panelmenu-header-action:focus {
        box-shadow: none;
      }

      .p-panelmenu .p-panelmenu-content {
        background: transparent;
        border: none;
        padding: 0 0 0 1rem;
        margin-top: 0.25rem;
      }

      .p-panelmenu .p-menuitem-link {
        padding: 0.6rem 1rem;
        color: var(--text-secondary);
        border-radius: 8px;
        margin-bottom: 0.25rem;
        transition: all 0.2s;
      }

      .p-panelmenu .p-menuitem-link:hover {
        background: #eff6ff;
        color: var(--primary-color);
      }

      .p-panelmenu .p-menuitem-link.router-link-active {
        background: #eff6ff;
        color: var(--primary-color);
        font-weight: 700;
      }

      .p-panelmenu .p-menuitem-icon {
        color: inherit;
        margin-left: 0.75rem;
        margin-right: 0;
      }

      .p-panelmenu .p-panelmenu-header-action .p-icon {
        order: -1;
        margin-right: auto;
        margin-left: 0;
        font-size: 0.8rem;
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
