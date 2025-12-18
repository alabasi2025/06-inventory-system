import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core Modules
import { PrismaModule } from '../prisma/prisma.module';
import { HealthModule } from '../modules/health/health.module';

// Feature Modules
import { CategoriesModule } from '../modules/categories/categories.module';
import { UnitsModule } from '../modules/units/units.module';
import { WarehousesModule } from '../modules/warehouses/warehouses.module';
import { ItemsModule } from '../modules/items/items.module';
import { SuppliersModule } from '../modules/suppliers/suppliers.module';
import { ContractsModule } from '../modules/contracts/contracts.module';
import { MovementsModule } from '../modules/movements/movements.module';
import { PurchaseRequestsModule } from '../modules/purchase-requests/purchase-requests.module';
import { QuotationsModule } from '../modules/quotations/quotations.module';
import { PurchaseOrdersModule } from '../modules/purchase-orders/purchase-orders.module';
import { GoodsReceiptsModule } from '../modules/goods-receipts/goods-receipts.module';
import { ReportsModule } from '../modules/reports/reports.module';

@Module({
  imports: [
    // Rate Limiting - القاعدة 7.5
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    
    // Core
    PrismaModule,
    HealthModule,
    
    // Master Data
    CategoriesModule,
    UnitsModule,
    WarehousesModule,
    ItemsModule,
    
    // Suppliers
    SuppliersModule,
    ContractsModule,
    
    // Inventory
    MovementsModule,
    
    // Purchasing
    PurchaseRequestsModule,
    QuotationsModule,
    PurchaseOrdersModule,
    GoodsReceiptsModule,
    
    // Reports
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Rate Limiting Guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
