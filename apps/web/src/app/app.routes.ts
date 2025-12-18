import { Route } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./features/categories/categories-list.component').then(m => m.CategoriesListComponent)
      },
      { 
        path: 'units', 
        loadComponent: () => import('./features/units/units-list.component').then(m => m.UnitsListComponent)
      },
      { 
        path: 'warehouses', 
        loadComponent: () => import('./features/warehouses/warehouses-list.component').then(m => m.WarehousesListComponent)
      },
      { 
        path: 'items', 
        loadComponent: () => import('./features/items/items-list.component').then(m => m.ItemsListComponent)
      },
      { 
        path: 'suppliers', 
        loadComponent: () => import('./features/suppliers/suppliers-list.component').then(m => m.SuppliersListComponent)
      },
      { 
        path: 'movements', 
        loadComponent: () => import('./features/movements/movements-list.component').then(m => m.MovementsListComponent)
      },
      { 
        path: 'purchase-requests', 
        loadComponent: () => import('./features/purchase-requests/purchase-requests-list.component').then(m => m.PurchaseRequestsListComponent)
      },
      { 
        path: 'quotations', 
        loadComponent: () => import('./features/quotations/quotations-list.component').then(m => m.QuotationsListComponent)
      },
      { 
        path: 'purchase-orders', 
        loadComponent: () => import('./features/purchase-orders/purchase-orders-list.component').then(m => m.PurchaseOrdersListComponent)
      },
      { 
        path: 'goods-receipts', 
        loadComponent: () => import('./features/goods-receipts/goods-receipts-list.component').then(m => m.GoodsReceiptsListComponent)
      },
      { 
        path: 'reports', 
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
