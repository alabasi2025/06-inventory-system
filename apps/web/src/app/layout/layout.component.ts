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
        <!-- Logo Section -->
        <div class="sidebar-header">
          <div class="logo-container" *ngIf="!sidebarCollapsed">
            <div class="logo-icon">
              <i class="pi pi-box"></i>
            </div>
            <div class="logo-text">
              <span class="logo-title">نظام المخازن</span>
              <span class="logo-subtitle">Inventory System</span>
            </div>
          </div>
          <div class="logo-mini" *ngIf="sidebarCollapsed">
            <i class="pi pi-box"></i>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li class="nav-item" *ngFor="let item of menuItems">
              <!-- Simple Link -->
              <a *ngIf="!item.items" 
                 [routerLink]="item.routerLink" 
                 routerLinkActive="active"
                 class="nav-link"
                 [title]="sidebarCollapsed ? item.label : ''">
                <div class="nav-icon">
                  <i [class]="item.icon"></i>
                </div>
                <span class="nav-text" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
                <div class="active-indicator"></div>
              </a>
              
              <!-- Group with Submenu -->
              <div *ngIf="item.items" class="nav-group">
                <div class="nav-group-header" 
                     (click)="toggleGroup(item)"
                     [class.expanded]="item.expanded">
                  <div class="nav-icon">
                    <i [class]="item.icon"></i>
                  </div>
                  <span class="nav-text" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
                  <i *ngIf="!sidebarCollapsed" 
                     class="expand-arrow pi"
                     [class.pi-chevron-down]="item.expanded"
                     [class.pi-chevron-left]="!item.expanded"></i>
                </div>
                <ul class="nav-sublist" [class.show]="item.expanded && !sidebarCollapsed">
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
        
        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="user-card" *ngIf="!sidebarCollapsed">
            <div class="user-avatar">
              <i class="pi pi-user"></i>
            </div>
            <div class="user-details">
              <span class="user-name">مدير النظام</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <i class="pi" [class.pi-angle-right]="sidebarCollapsed" [class.pi-angle-left]="!sidebarCollapsed"></i>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-wrapper">
        <!-- Top Bar -->
        <header class="topbar">
          <div class="topbar-right">
            <button class="menu-toggle" (click)="toggleSidebar()">
              <i class="pi pi-bars"></i>
            </button>
            <div class="breadcrumb">
              <span class="page-title">{{ currentPageTitle }}</span>
            </div>
          </div>
          <div class="topbar-left">
            <div class="topbar-actions">
              <button class="action-btn" title="الإشعارات">
                <i class="pi pi-bell"></i>
                <span class="badge">3</span>
              </button>
              <button class="action-btn" title="الإعدادات">
                <i class="pi pi-cog"></i>
              </button>
            </div>
            <div class="user-menu">
              <span class="user-greeting">مرحباً، مدير النظام</span>
              <div class="avatar-small">
                <i class="pi pi-user"></i>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 320px;
      --sidebar-collapsed-width: 80px;
      --topbar-height: 70px;
      
      /* Modern Color Palette */
      --primary: #6366f1;
      --primary-dark: #4f46e5;
      --primary-light: #818cf8;
      --primary-glow: rgba(99, 102, 241, 0.3);
      
      --sidebar-bg: #0f172a;
      --sidebar-surface: #1e293b;
      --sidebar-border: rgba(255, 255, 255, 0.08);
      
      --text-primary: #f8fafc;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      
      --hover-bg: rgba(255, 255, 255, 0.05);
      --active-bg: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1));
      
      --content-bg: #f1f5f9;
      --card-bg: #ffffff;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    * {
      box-sizing: border-box;
    }

    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      direction: rtl;
      background: var(--content-bg);
    }

    /* ==================== SIDEBAR ==================== */
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
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 1px solid var(--sidebar-border);
    }

    .sidebar-collapsed .sidebar {
      width: var(--sidebar-collapsed-width);
    }

    /* Logo Section */
    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--sidebar-border);
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .logo-icon i {
      font-size: 1.5rem;
      color: white;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.5px;
    }

    .logo-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .logo-mini {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .logo-mini i {
      font-size: 1.5rem;
      color: white;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0.75rem;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: var(--sidebar-border);
      border-radius: 4px;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link, .nav-group-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .nav-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: var(--sidebar-surface);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .nav-icon i {
      font-size: 1.125rem;
      color: var(--text-muted);
      transition: color 0.2s ease;
    }

    .nav-text {
      font-size: 0.9375rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-link:hover, .nav-group-header:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }

    .nav-link:hover .nav-icon, .nav-group-header:hover .nav-icon {
      background: var(--primary);
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .nav-link:hover .nav-icon i, .nav-group-header:hover .nav-icon i {
      color: white;
    }

    .nav-link.active {
      background: var(--active-bg);
      color: var(--text-primary);
    }

    .nav-link.active .nav-icon {
      background: var(--primary);
      box-shadow: 0 4px 12px var(--primary-glow);
    }

    .nav-link.active .nav-icon i {
      color: white;
    }

    .active-indicator {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background: var(--primary);
      border-radius: 0 4px 4px 0;
      transition: height 0.2s ease;
    }

    .nav-link.active .active-indicator {
      height: 60%;
    }

    /* Expand Arrow */
    .expand-arrow {
      margin-right: auto;
      font-size: 0.75rem;
      color: var(--text-muted);
      transition: transform 0.3s ease;
    }

    .nav-group-header.expanded .expand-arrow {
      transform: rotate(180deg);
    }

    /* Submenu */
    .nav-sublist {
      list-style: none;
      padding: 0;
      margin: 0;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .nav-sublist.show {
      max-height: 500px;
      padding: 0.5rem 0 0.5rem 3.5rem;
    }

    .nav-sublink {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      margin-bottom: 0.25rem;
      position: relative;
    }

    .nav-sublink::before {
      content: '';
      position: absolute;
      right: -1.5rem;
      top: 50%;
      width: 8px;
      height: 8px;
      border: 2px solid var(--sidebar-border);
      border-radius: 50%;
      transform: translateY(-50%);
      transition: all 0.2s ease;
    }

    .nav-sublink:hover {
      color: var(--text-primary);
      background: var(--hover-bg);
    }

    .nav-sublink:hover::before {
      border-color: var(--primary);
      background: var(--primary);
    }

    .nav-sublink.active {
      color: var(--primary-light);
      background: var(--active-bg);
    }

    .nav-sublink.active::before {
      border-color: var(--primary);
      background: var(--primary);
    }

    .nav-sublink i {
      font-size: 0.875rem;
      width: 20px;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--sidebar-border);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--sidebar-surface);
      border-radius: 12px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-avatar i {
      font-size: 1.25rem;
      color: white;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .collapse-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--sidebar-surface);
      border: 1px solid var(--sidebar-border);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .collapse-btn:hover {
      background: var(--hover-bg);
      color: var(--primary-light);
      border-color: var(--primary);
    }

    /* ==================== MAIN CONTENT ==================== */
    .main-wrapper {
      flex: 1;
      margin-right: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-collapsed .main-wrapper {
      margin-right: var(--sidebar-collapsed-width);
    }

    /* Top Bar */
    .topbar {
      height: var(--topbar-height);
      background: var(--card-bg);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .menu-toggle:hover {
      background: #f1f5f9;
      color: var(--primary);
    }

    .page-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .action-btn {
      width: 42px;
      height: 42px;
      border: none;
      background: #f1f5f9;
      border-radius: 10px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: var(--primary);
      color: white;
    }

    .action-btn .badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      color: white;
      font-size: 0.625rem;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .user-greeting {
      font-size: 0.875rem;
      color: #475569;
      font-weight: 500;
    }

    .avatar-small {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-small i {
      font-size: 1rem;
      color: white;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 1.5rem;
      background: var(--content-bg);
    }

    /* ==================== RESPONSIVE ==================== */
    @media (max-width: 1024px) {
      .sidebar {
        transform: translateX(100%);
      }

      .layout-wrapper:not(.sidebar-collapsed) .sidebar {
        transform: translateX(0);
      }

      .main-wrapper {
        margin-right: 0 !important;
      }

      .menu-toggle {
        display: flex;
      }

      .user-greeting {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .topbar {
        padding: 0 1rem;
      }

      .main-content {
        padding: 1rem;
      }

      .topbar-actions {
        display: none;
      }
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
        { label: 'الموردين', icon: 'pi pi-users', routerLink: '/suppliers' }
      ]
    },
    {
      label: 'العمليات',
      icon: 'pi pi-sync',
      expanded: false,
      items: [
        { label: 'حركات المخزون', icon: 'pi pi-arrow-right-arrow-left', routerLink: '/movements' },
        { label: 'أوامر الشراء', icon: 'pi pi-shopping-cart', routerLink: '/purchase-orders' }
      ]
    },
    {
      label: 'التقارير',
      icon: 'pi pi-chart-bar',
      expanded: false,
      items: [
        { label: 'تقرير المخزون', icon: 'pi pi-file', routerLink: '/reports/inventory' },
        { label: 'تقرير الحركات', icon: 'pi pi-file', routerLink: '/reports/movements' }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });
    this.updatePageTitle();
  }

  updatePageTitle() {
    const url = this.router.url;
    const titles: { [key: string]: string } = {
      '/dashboard': 'لوحة التحكم',
      '/categories': 'التصنيفات',
      '/units': 'وحدات القياس',
      '/warehouses': 'المستودعات',
      '/items': 'الأصناف',
      '/suppliers': 'الموردين',
      '/movements': 'حركات المخزون',
      '/purchase-orders': 'أوامر الشراء'
    };
    this.currentPageTitle = titles[url] || 'نظام المخازن';
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleGroup(item: any) {
    item.expanded = !item.expanded;
  }
}
