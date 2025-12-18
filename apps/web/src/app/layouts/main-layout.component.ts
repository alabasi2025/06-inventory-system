import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100" dir="rtl">
      <!-- Sidebar -->
      <aside class="fixed right-0 top-0 w-64 h-full bg-blue-900 text-white shadow-lg z-50">
        <div class="p-4 border-b border-blue-800">
          <h1 class="text-xl font-bold">نظام المخزون</h1>
          <p class="text-sm text-blue-300">إدارة المخزون والمشتريات</p>
        </div>
        
        <nav class="p-4">
          <ul class="space-y-2">
            <li>
              <a routerLink="/dashboard" routerLinkActive="bg-blue-800" 
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                لوحة التحكم
              </a>
            </li>
            
            <li class="pt-4">
              <span class="text-xs text-blue-400 uppercase px-4">البيانات الأساسية</span>
            </li>
            <li>
              <a routerLink="/categories" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                التصنيفات
              </a>
            </li>
            <li>
              <a routerLink="/units" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                </svg>
                وحدات القياس
              </a>
            </li>
            <li>
              <a routerLink="/warehouses" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                المستودعات
              </a>
            </li>
            <li>
              <a routerLink="/items" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
                الأصناف
              </a>
            </li>
            <li>
              <a routerLink="/suppliers" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                الموردين
              </a>
            </li>
            
            <li class="pt-4">
              <span class="text-xs text-blue-400 uppercase px-4">المخزون</span>
            </li>
            <li>
              <a routerLink="/movements" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                حركات المخزون
              </a>
            </li>
            
            <li class="pt-4">
              <span class="text-xs text-blue-400 uppercase px-4">المشتريات</span>
            </li>
            <li>
              <a routerLink="/purchase-requests" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                طلبات الشراء
              </a>
            </li>
            <li>
              <a routerLink="/quotations" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
                عروض الأسعار
              </a>
            </li>
            <li>
              <a routerLink="/purchase-orders" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                أوامر الشراء
              </a>
            </li>
            <li>
              <a routerLink="/goods-receipts" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                محاضر الاستلام
              </a>
            </li>
            
            <li class="pt-4">
              <span class="text-xs text-blue-400 uppercase px-4">التقارير</span>
            </li>
            <li>
              <a routerLink="/reports" routerLinkActive="bg-blue-800"
                 class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                التقارير
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="mr-64 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b px-6 py-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-800">نظام إدارة المخزون والمشتريات</h2>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">مرحباً، المستخدم</span>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class MainLayoutComponent {}
