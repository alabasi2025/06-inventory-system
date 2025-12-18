import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ==================== Dashboard ====================
  async getDashboard() {
    const [
      totalItems,
      totalWarehouses,
      totalSuppliers,
      lowStockItems,
      pendingPurchaseRequests,
      pendingPurchaseOrders,
      recentMovements,
      stockValue,
    ] = await Promise.all([
      this.prisma.inv_items.count({ where: { is_active: true } }),
      this.prisma.inv_warehouses.count({ where: { is_active: true } }),
      this.prisma.inv_suppliers.count({ where: { is_active: true } }),
      this.getLowStockItemsCount(),
      this.prisma.inv_purchase_requests.count({ where: { status: 'submitted' } }),
      this.prisma.inv_purchase_orders.count({ where: { status: { in: ['approved', 'sent'] } } }),
      this.getRecentMovements(5),
      this.getTotalStockValue(),
    ]);

    return {
      summary: {
        totalItems,
        totalWarehouses,
        totalSuppliers,
        lowStockItems,
        pendingPurchaseRequests,
        pendingPurchaseOrders,
        stockValue,
      },
      recentMovements,
    };
  }

  // ==================== Stock Reports ====================
  async getStockReport(warehouseId?: string) {
    const where = warehouseId ? { warehouse_id: warehouseId } : {};

    const stockItems = await this.prisma.inv_warehouse_items.findMany({
      where,
      include: {
        warehouse: true,
        item: {
          include: {
            category: true,
            unit: true,
          },
        },
      },
      orderBy: { item: { name: 'asc' } },
    });

    const report = stockItems.map((si) => ({
      warehouseId: si.warehouse_id,
      warehouseName: si.warehouse.name,
      itemId: si.item_id,
      itemCode: si.item.code,
      itemName: si.item.name,
      categoryName: si.item.category?.name,
      unitSymbol: si.item.unit?.symbol,
      quantity: Number(si.quantity),
      availableQty: Number(si.available_qty),
      reservedQty: Number(si.reserved_qty),
      avgCost: Number(si.avg_cost),
      totalValue: Number(si.quantity) * Number(si.avg_cost),
      minStock: Number(si.item.min_stock),
      maxStock: Number(si.item.max_stock),
      isLowStock: Number(si.quantity) <= Number(si.item.min_stock),
    }));

    const totalValue = report.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = report.length;
    const lowStockCount = report.filter((item) => item.isLowStock).length;

    return {
      data: report,
      summary: {
        totalItems,
        totalValue,
        lowStockCount,
      },
    };
  }

  async getLowStockReport() {
    const items = await this.prisma.inv_items.findMany({
      where: { is_active: true },
      include: {
        category: true,
        unit: true,
        warehouse_items: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    const lowStockItems = items
      .map((item) => {
        const totalStock = item.warehouse_items.reduce(
          (sum, wi) => sum + Number(wi.quantity),
          0,
        );
        return {
          itemId: item.id,
          itemCode: item.code,
          itemName: item.name,
          categoryName: item.category?.name,
          unitSymbol: item.unit?.symbol,
          totalStock,
          minStock: Number(item.min_stock),
          reorderPoint: Number(item.reorder_point),
          reorderQty: Number(item.reorder_qty),
          shortage: Number(item.min_stock) - totalStock,
          warehouseBreakdown: item.warehouse_items.map((wi) => ({
            warehouseName: wi.warehouse.name,
            quantity: Number(wi.quantity),
          })),
        };
      })
      .filter((item) => item.totalStock <= item.minStock)
      .sort((a, b) => b.shortage - a.shortage);

    return {
      data: lowStockItems,
      summary: {
        totalLowStockItems: lowStockItems.length,
        criticalItems: lowStockItems.filter((item) => item.totalStock === 0).length,
      },
    };
  }

  async getStockMovementReport(fromDate?: Date, toDate?: Date, warehouseId?: string) {
    const where: any = { status: 'confirmed' };

    if (fromDate || toDate) {
      where.movement_date = {};
      if (fromDate) where.movement_date.gte = fromDate;
      if (toDate) where.movement_date.lte = toDate;
    }

    if (warehouseId) {
      where.OR = [
        { warehouse_id: warehouseId },
        { to_warehouse_id: warehouseId },
      ];
    }

    const movements = await this.prisma.inv_movements.findMany({
      where,
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { movement_date: 'desc' },
    });

    const summary = {
      totalReceipts: 0,
      totalIssues: 0,
      totalTransfers: 0,
      totalAdjustments: 0,
      receiptValue: 0,
      issueValue: 0,
    };

    movements.forEach((mov) => {
      const value = Number(mov.total_cost);
      switch (mov.type) {
        case 'receipt':
          summary.totalReceipts++;
          summary.receiptValue += value;
          break;
        case 'issue':
          summary.totalIssues++;
          summary.issueValue += value;
          break;
        case 'transfer':
          summary.totalTransfers++;
          break;
        case 'adjustment':
          summary.totalAdjustments++;
          break;
      }
    });

    return {
      data: movements,
      summary,
    };
  }

  // ==================== Purchase Reports ====================
  async getPurchaseReport(fromDate?: Date, toDate?: Date, supplierId?: string) {
    const where: any = {};

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) where.created_at.gte = fromDate;
      if (toDate) where.created_at.lte = toDate;
    }

    if (supplierId) {
      where.supplier_id = supplierId;
    }

    const orders = await this.prisma.inv_purchase_orders.findMany({
      where,
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const summary = {
      totalOrders: orders.length,
      draftOrders: 0,
      approvedOrders: 0,
      sentOrders: 0,
      partialOrders: 0,
      receivedOrders: 0,
      cancelledOrders: 0,
      totalValue: 0,
      receivedValue: 0,
    };

    orders.forEach((order) => {
      summary.totalValue += Number(order.total_amount);

      switch (order.status) {
        case 'draft':
          summary.draftOrders++;
          break;
        case 'approved':
          summary.approvedOrders++;
          break;
        case 'sent':
          summary.sentOrders++;
          break;
        case 'partial':
          summary.partialOrders++;
          break;
        case 'received':
          summary.receivedOrders++;
          summary.receivedValue += Number(order.total_amount);
          break;
        case 'cancelled':
          summary.cancelledOrders++;
          break;
      }
    });

    return {
      data: orders,
      summary,
    };
  }

  async getSupplierPerformanceReport() {
    const suppliers = await this.prisma.inv_suppliers.findMany({
      where: { is_active: true },
      include: {
        purchase_orders: {
          where: { status: { in: ['received', 'partial'] } },
          include: {
            receipts: true,
          },
        },
      },
    });

    const report = suppliers.map((supplier) => {
      const orders = supplier.purchase_orders;
      const totalOrders = orders.length;
      const totalValue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Calculate on-time delivery
      let onTimeDeliveries = 0;
      orders.forEach((order) => {
        if (order.expected_date && order.receipts.length > 0) {
          const lastReceipt = order.receipts[order.receipts.length - 1];
          if (lastReceipt.receipt_date <= order.expected_date) {
            onTimeDeliveries++;
          }
        } else {
          onTimeDeliveries++; // No expected date = considered on time
        }
      });

      const onTimeRate = totalOrders > 0 ? (onTimeDeliveries / totalOrders) * 100 : 0;

      return {
        supplierId: supplier.id,
        supplierCode: supplier.code,
        supplierName: supplier.name,
        category: supplier.category,
        totalOrders,
        totalValue,
        onTimeDeliveries,
        onTimeRate: Number(onTimeRate.toFixed(2)),
        rating: supplier.rating,
      };
    });

    return {
      data: report.sort((a, b) => b.totalValue - a.totalValue),
      summary: {
        totalSuppliers: report.length,
        avgOnTimeRate: report.length > 0
          ? Number((report.reduce((sum, s) => sum + s.onTimeRate, 0) / report.length).toFixed(2))
          : 0,
      },
    };
  }

  // ==================== Item Reports ====================
  async getItemMovementHistory(itemId: string, fromDate?: Date, toDate?: Date) {
    const where: any = { item_id: itemId };

    if (fromDate || toDate) {
      where.movement = {
        movement_date: {},
      };
      if (fromDate) where.movement.movement_date.gte = fromDate;
      if (toDate) where.movement.movement_date.lte = toDate;
    }

    const movements = await this.prisma.inv_movement_items.findMany({
      where,
      include: {
        movement: {
          include: {
            warehouse: true,
            to_warehouse: true,
          },
        },
      },
      orderBy: { movement: { movement_date: 'desc' } },
    });

    const item = await this.prisma.inv_items.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        unit: true,
      },
    });

    return {
      item,
      movements: movements.map((mi) => ({
        date: mi.movement.movement_date,
        type: mi.movement.type,
        movementNo: mi.movement.movement_no,
        warehouse: mi.movement.warehouse.name,
        toWarehouse: mi.movement.to_warehouse?.name,
        quantity: Number(mi.quantity),
        unitCost: Number(mi.unit_cost),
        totalCost: Number(mi.total_cost),
        batchNo: mi.batch_no,
        serialNo: mi.serial_no,
      })),
    };
  }

  // ==================== Expiry Reports ====================
  async getExpiryReport(days = 90) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const expiringItems = await this.prisma.inv_movement_items.findMany({
      where: {
        expiry_date: {
          lte: futureDate,
          gte: new Date(),
        },
        movement: {
          status: 'confirmed',
          type: 'receipt',
        },
      },
      include: {
        item: {
          include: {
            unit: true,
          },
        },
        movement: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { expiry_date: 'asc' },
    });

    return {
      data: expiringItems.map((item) => ({
        itemCode: item.item.code,
        itemName: item.item.name,
        warehouse: item.movement.warehouse.name,
        batchNo: item.batch_no,
        quantity: Number(item.quantity),
        expiryDate: item.expiry_date,
        daysToExpiry: Math.ceil(
          (new Date(item.expiry_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
      })),
      summary: {
        totalExpiringItems: expiringItems.length,
        expiredItems: expiringItems.filter((i) => new Date(i.expiry_date!) < new Date()).length,
      },
    };
  }

  // ==================== Helper Methods ====================
  private async getLowStockItemsCount(): Promise<number> {
    const items = await this.prisma.inv_items.findMany({
      where: { is_active: true },
      include: {
        warehouse_items: true,
      },
    });

    return items.filter((item) => {
      const totalStock = item.warehouse_items.reduce(
        (sum, wi) => sum + Number(wi.quantity),
        0,
      );
      return totalStock <= Number(item.min_stock);
    }).length;
  }

  private async getRecentMovements(limit: number) {
    return this.prisma.inv_movements.findMany({
      where: { status: 'confirmed' },
      include: {
        warehouse: true,
        to_warehouse: true,
      },
      orderBy: { movement_date: 'desc' },
      take: limit,
    });
  }

  private async getTotalStockValue(): Promise<number> {
    const result = await this.prisma.$queryRaw<[{ total: number }]>`
      SELECT COALESCE(SUM(quantity * avg_cost), 0) as total
      FROM inv_warehouse_items
    `;
    return Number(result[0]?.total) || 0;
  }
}
