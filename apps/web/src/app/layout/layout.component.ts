import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="layout-wrapper" [class.sidebar-collapsed]="sidebarCollapsed">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo" *ngIf="!sidebarCollapsed">
            <i class="pi pi-warehouse"></i>
            <span>نظام المخازن</span>
          </div>
          <div class="logo-mini" *ngIf="sidebarCollapsed">
            <i class="pi pi-warehouse"></i>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item" *ngFor="let item of menuItems">
              <a *ngIf="!item.items" 
                 [routerLink]="item.routerLink" 
                 routerLinkActive="active"
                 class="nav-link"
                 [title]="sidebarCollapsed ? item.label : ''">
                <i [class]="item.icon"></i>
                <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
              </a>
              
              <div *ngIf="item.items" class="nav-group">
                <div class="nav-group-header" 
                     (click)="toggleGroup(item)"
                     [class.expanded]="item.expanded">
                  <i [class]="item.icon"></i>
                  <span *ngIf="!sidebarCollapsed">{{ item.label }}</span>
                  <i *ngIf="!sidebarCollapsed" 
                     class="pi expand-icon"
                     [class.pi-chevron-down]="item.expanded"
                     [class.pi-chevron-left]="!item.expanded"></i>
                </div>
                <ul class="nav-sublist" *ngIf="item.expanded && !sidebarCollapsed">
                  <li *ngFor="let subItem of item.items">
                    <a [routerLink]="subItem.routerLink" 
                       routerLinkActive="active"
                       class="nav-sublink">
                      <i [class]="subItem.icon"></i>
                      <span>{{ subItem.label }}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
        
        <div class="sidebar-footer">
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="pi" [class.pi-angle-right]="sidebarCollapsed" [class.pi-angle-left]="!sidebarCollapsed"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <header class="topbar">
          <div class="topbar-start">
            <button class="mobile-toggle" (click)="toggleSidebar()">
              <i class="pi pi-bars"></i>
            </button>
            <h1 class="page-title">{{ currentPageTitle }}</h1>
          </div>
          <div class="topbar-end">
            <div class="user-info">
              <span class="user-name">مدير النظام</span>
              <div class="user-avatar">
                <i class="pi pi-user"></i>
              </div>
            </div>
          </div>
        </header>
        
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 320px;
      --sidebar-collapsed-width: 70px;
      --topbar-height: 64px;
      --primary-color: #1e40af;
      --primary-dark: #1e3a8a;
      --primary-light: #3b82f6;
      --sidebar-bg: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
      --text-light: #e2e8f0;
      --text-muted: #94a3b8;
      --border-color: rgba(255, 255, 255, 0.1);
      --hover-bg: rgba(255, 255, 255, 0.08);
      --active-bg: rgba(59, 130, 246, 0.2);
      --content-bg: #f1f5f9;
    }

    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      direction: rtl;
    }

    /* Sidebar Styles */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--sidebar-bg);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      z-index: 1000;
      transition: width 0.3s ease;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    }

    .sidebar-collapsed .sidebar {
      width: var(--sidebar-collapsed-width);
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .logo i, .logo-mini i {
      font-size: 1.75rem;
      color: var(--primary-light);
    }

    .logo-mini {
      color: white;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin: 0.25rem 0.75rem;
    }

    .nav-link, .nav-group-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: var(--text-light);
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
      font-size: 0.9375rem;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-link:hover, .nav-group-header:hover {
      background: var(--hover-bg);
      color: white;
    }

    .nav-link.active {
      background: var(--active-bg);
      color: var(--primary-light);
      font-weight: 600;
    }

    .nav-link.active i {
      color: var(--primary-light);
    }

    .nav-link i, .nav-group-header i:first-child {
      font-size: 1.125rem;
      width: 24px;
      text-align: center;
      color: var(--text-muted);
      transition: color 0.2s ease;
    }

    .nav-link:hover i, .nav-group-header:hover i {
      color: var(--primary-light);
    }

    .expand-icon {
      margin-right: auto;
      font-size: 0.75rem !important;
      transition: transform 0.2s ease;
    }

    .nav-sublist {
      list-style: none;
      padding: 0.5rem 0 0.5rem 1rem;
      margin: 0;
    }

    .nav-sublink {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      margin: 0.125rem 0;
    }

    .nav-sublink:hover {
      background: var(--hover-bg);
      color: white;
    }

    .nav-sublink.active {
      background: var(--active-bg);
      color: var(--primary-light);
      font-weight: 500;
    }

    .nav-sublink i {
      font-size: 0.875rem;
      width: 20px;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .toggle-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--hover-bg);
      border: none;
      border-radius: 0.5rem;
      color: var(--text-light);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-btn:hover {
      background: var(--active-bg);
      color: var(--primary-light);
    }

    /* Main Content Styles */
    .main-wrapper {
      flex: 1;
      margin-right: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-right 0.3s ease;
    }

    .sidebar-collapsed .main-wrapper {
      margin-right: var(--sidebar-collapsed-width);
    }

    .topbar {
      height: var(--topbar-height);
      background: white;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .topbar-start {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
    }

    .page-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }

    .topbar-end {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .main-content {
      flex: 1;
      padding: 1.5rem;
      background: var(--content-bg);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(100%);
      }

      .layout-wrapper:not(.sidebar-collapsed) .sidebar {
        transform: translateX(0);
      }

      .main-wrapper {
        margin-right: 0;
      }

      .mobile-toggle {
        display: block;
      }

      .sidebar-collapsed .sidebar {
        transform: translateX(100%);
      }
    }

    /* Scrollbar Styles */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarCollapsed = false;
  currentPageTitle = 'لوحة التحكم';
  
  menuItems: any[] = [
    { 
      label: 'لوحة التحكم', 
      icon: 'pi pi-home', 
      routerLink: '/dashboard' 
    },
    {
      label: 'البيانات الأساسية',
      icon: 'pi pi-database',
      expanded: true,
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
      expanded: false,
      items: [
        { label: 'حركات المخزون', icon: 'pi pi-arrows-h', routerLink: '/movements' },
        { label: 'أوامر الشراء', icon: 'pi pi-shopping-cart', routerLink: '/purchase-orders' },
      ]
    },
    {
      label: 'التقارير',
      icon: 'pi pi-chart-bar',
      expanded: false,
      items: [
        { label: 'تقرير المخزون', icon: 'pi pi-file', routerLink: '/reports/inventory' },
        { label: 'تقرير الحركات', icon: 'pi pi-file', routerLink: '/reports/movements' },
      ]
    },
  ];

  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'لوحة التحكم',
    '/categories': 'التصنيفات',
    '/units': 'وحدات القياس',
    '/warehouses': 'المستودعات',
    '/items': 'الأصناف',
    '/suppliers': 'الموردين',
    '/movements': 'حركات المخزون',
    '/purchase-orders': 'أوامر الشراء',
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.updatePageTitle(this.router.url);
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  updatePageTitle(url: string) {
    this.currentPageTitle = this.pageTitles[url] || 'نظام المخازن';
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleGroup(item: any) {
    if (!this.sidebarCollapsed) {
      item.expanded = !item.expanded;
    }
  }
}
