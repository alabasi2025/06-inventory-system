import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';
import { UnitsModule } from '../units/units.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ItemsModule } from '../items/items.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { MovementsModule } from '../movements/movements.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CategoriesModule,
    UnitsModule,
    WarehousesModule,
    ItemsModule,
    SuppliersModule,
    MovementsModule,
    PurchaseOrdersModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
