import { Route } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) 
      },
      { 
        path: 'categories', 
        loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) 
      },
      { 
        path: 'units', 
        loadComponent: () => import('./features/units/units.component').then(m => m.UnitsComponent) 
      },
      { 
        path: 'warehouses', 
        loadComponent: () => import('./features/warehouses/warehouses.component').then(m => m.WarehousesComponent) 
      },
      { 
        path: 'items', 
        loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent) 
      },
      { 
        path: 'suppliers', 
        loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) 
      },
      { 
        path: 'movements', 
        loadComponent: () => import('./features/movements/movements.component').then(m => m.MovementsComponent) 
      },
      { 
        path: 'purchase-orders', 
        loadComponent: () => import('./features/purchase-orders/purchase-orders.component').then(m => m.PurchaseOrdersComponent) 
      },
      { 
        path: 'grn', 
        loadComponent: () => import('./features/grn/grn.component').then(m => m.GrnComponent) 
      },
      { 
        path: 'purchase-invoices', 
        loadComponent: () => import('./features/purchase-invoices/purchase-invoices.component').then(m => m.PurchaseInvoicesComponent) 
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
