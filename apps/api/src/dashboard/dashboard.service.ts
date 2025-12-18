import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const [
      categoriesCount,
      unitsCount,
      warehousesCount,
      itemsCount,
      suppliersCount,
      pendingOrders,
      lowStockItems,
      recentMovements,
    ] = await Promise.all([
      this.prisma.invCategory.count({ where: { isActive: true } }),
      this.prisma.invUnit.count({ where: { isActive: true } }),
      this.prisma.invWarehouse.count({ where: { isActive: true } }),
      this.prisma.invItem.count({ where: { isActive: true } }),
      this.prisma.invSupplier.count({ where: { isActive: true } }),
      this.prisma.invPurchaseOrder.count({ where: { status: { in: ['pending', 'approved', 'sent'] } } }),
      this.getLowStockItems(),
      this.getRecentMovements(),
    ]);

    // حساب إجمالي قيمة المخزون
    const stocks = await this.prisma.invStock.findMany({
      include: { item: true },
    });
    
    let totalStockValue = new Decimal(0);
    for (const stock of stocks) {
      totalStockValue = totalStockValue.plus(
        new Decimal(stock.quantity).times(stock.avgCost)
      );
    }

    return {
      summary: {
        categories: categoriesCount,
        units: unitsCount,
        warehouses: warehousesCount,
        items: itemsCount,
        suppliers: suppliersCount,
        pendingOrders,
        totalStockValue: totalStockValue.toNumber(),
      },
      lowStockItems,
      recentMovements,
    };
  }

  async getLowStockItems() {
    const items = await this.prisma.invItem.findMany({
      where: { isActive: true },
      include: {
        stocks: true,
        unit: true,
        category: true,
      },
    });

    const lowStock = items.filter(item => {
      const totalQty = item.stocks.reduce((sum, s) => sum + Number(s.quantity), 0);
      return totalQty <= Number(item.minStock);
    }).map(item => ({
      id: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit.name,
      category: item.category.name,
      minStock: Number(item.minStock),
      currentStock: item.stocks.reduce((sum, s) => sum + Number(s.quantity), 0),
      reorderQty: Number(item.reorderQty || 0),
    }));

    return lowStock.slice(0, 10);
  }

  async getRecentMovements() {
    const movements = await this.prisma.invMovement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { item: true } },
      },
    });

    return movements.map(m => ({
      id: m.id,
      movementNo: m.movementNo,
      type: m.type,
      status: m.status,
      fromWarehouse: m.fromWarehouse?.name,
      toWarehouse: m.toWarehouse?.name,
      itemsCount: m.items.length,
      totalAmount: Number(m.totalAmount),
      date: m.movementDate,
    }));
  }

  async getStockReport(warehouseId?: string) {
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;

    const stocks = await this.prisma.invStock.findMany({
      where,
      include: {
        warehouse: true,
        item: {
          include: { category: true, unit: true },
        },
      },
      orderBy: { item: { name: 'asc' } },
    });

    return stocks.map(s => ({
      warehouseCode: s.warehouse.code,
      warehouseName: s.warehouse.name,
      itemCode: s.item.code,
      itemName: s.item.name,
      category: s.item.category.name,
      unit: s.item.unit.name,
      quantity: Number(s.quantity),
      avgCost: Number(s.avgCost),
      totalValue: Number(new Decimal(s.quantity).times(s.avgCost)),
      minStock: Number(s.item.minStock),
      status: Number(s.quantity) <= Number(s.item.minStock) ? 'low' : 'ok',
    }));
  }

  async getMovementReport(params: { fromDate?: string; toDate?: string; type?: string; warehouseId?: string }) {
    const where: any = {};
    
    if (params.type) where.type = params.type;
    if (params.warehouseId) {
      where.OR = [
        { fromWarehouseId: params.warehouseId },
        { toWarehouseId: params.warehouseId },
      ];
    }
    if (params.fromDate || params.toDate) {
      where.movementDate = {};
      if (params.fromDate) where.movementDate.gte = new Date(params.fromDate);
      if (params.toDate) where.movementDate.lte = new Date(params.toDate);
    }

    const movements = await this.prisma.invMovement.findMany({
      where,
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: { item: { include: { unit: true } } },
        },
      },
      orderBy: { movementDate: 'desc' },
    });

    return movements.map(m => ({
      movementNo: m.movementNo,
      type: m.type,
      status: m.status,
      date: m.movementDate,
      fromWarehouse: m.fromWarehouse?.name,
      toWarehouse: m.toWarehouse?.name,
      items: m.items.map(i => ({
        code: i.item.code,
        name: i.item.name,
        unit: i.item.unit.name,
        quantity: Number(i.quantity),
        unitCost: Number(i.unitCost),
        totalCost: Number(i.totalCost),
      })),
      totalAmount: Number(m.totalAmount),
    }));
  }

  async getPurchaseReport(params: { fromDate?: string; toDate?: string; supplierId?: string; status?: string }) {
    const where: any = {};
    
    if (params.supplierId) where.supplierId = params.supplierId;
    if (params.status) where.status = params.status;
    if (params.fromDate || params.toDate) {
      where.orderDate = {};
      if (params.fromDate) where.orderDate.gte = new Date(params.fromDate);
      if (params.toDate) where.orderDate.lte = new Date(params.toDate);
    }

    const orders = await this.prisma.invPurchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { item: true } },
      },
      orderBy: { orderDate: 'desc' },
    });

    const summary = {
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      byStatus: {
        draft: orders.filter(o => o.status === 'draft').length,
        pending: orders.filter(o => o.status === 'pending').length,
        approved: orders.filter(o => o.status === 'approved').length,
        sent: orders.filter(o => o.status === 'sent').length,
        received: orders.filter(o => o.status === 'received').length,
      },
    };

    return {
      summary,
      orders: orders.map(o => ({
        orderNo: o.orderNo,
        supplier: o.supplier.name,
        date: o.orderDate,
        status: o.status,
        itemsCount: o.items.length,
        subtotal: Number(o.subtotal),
        tax: Number(o.taxAmount),
        discount: Number(o.discountAmount),
        total: Number(o.totalAmount),
      })),
    };
  }
}
