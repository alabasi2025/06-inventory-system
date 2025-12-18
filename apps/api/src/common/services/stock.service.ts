import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async updateStock(
    warehouseId: string,
    itemId: string,
    quantity: number,
    operation: 'add' | 'subtract',
    unitCost?: number,
  ) {
    // Find or create warehouse item
    let warehouseItem = await this.prisma.inv_warehouse_items.findUnique({
      where: {
        warehouse_id_item_id: {
          warehouse_id: warehouseId,
          item_id: itemId,
        },
      },
    });

    if (!warehouseItem) {
      if (operation === 'subtract') {
        throw new BadRequestException('لا يوجد رصيد للصنف في هذا المستودع');
      }

      // Create new warehouse item
      warehouseItem = await this.prisma.inv_warehouse_items.create({
        data: {
          warehouse_id: warehouseId,
          item_id: itemId,
          quantity: quantity,
          available_qty: quantity,
          avg_cost: unitCost || 0,
        },
      });
    } else {
      const currentQty = Number(warehouseItem.quantity);
      const currentAvailable = Number(warehouseItem.available_qty);
      const currentAvgCost = Number(warehouseItem.avg_cost);

      let newQty: number;
      let newAvailable: number;
      let newAvgCost: number;

      if (operation === 'add') {
        newQty = currentQty + quantity;
        newAvailable = currentAvailable + quantity;

        // Calculate weighted average cost
        if (unitCost && unitCost > 0) {
          const totalOldValue = currentQty * currentAvgCost;
          const totalNewValue = quantity * unitCost;
          newAvgCost = newQty > 0 ? (totalOldValue + totalNewValue) / newQty : unitCost;
        } else {
          newAvgCost = currentAvgCost;
        }
      } else {
        // Subtract
        if (currentAvailable < quantity) {
          throw new BadRequestException(
            `الكمية المتاحة (${currentAvailable}) أقل من الكمية المطلوبة (${quantity})`,
          );
        }
        newQty = currentQty - quantity;
        newAvailable = currentAvailable - quantity;
        newAvgCost = currentAvgCost; // Keep the same average cost when issuing
      }

      warehouseItem = await this.prisma.inv_warehouse_items.update({
        where: { id: warehouseItem.id },
        data: {
          quantity: newQty,
          available_qty: newAvailable,
          avg_cost: newAvgCost,
          last_updated: new Date(),
        },
      });
    }

    // Update item's average cost
    if (operation === 'add' && unitCost) {
      await this.updateItemAvgCost(itemId, unitCost, quantity);
    }

    return warehouseItem;
  }

  async reserveStock(warehouseId: string, itemId: string, quantity: number) {
    const warehouseItem = await this.prisma.inv_warehouse_items.findUnique({
      where: {
        warehouse_id_item_id: {
          warehouse_id: warehouseId,
          item_id: itemId,
        },
      },
    });

    if (!warehouseItem) {
      throw new BadRequestException('لا يوجد رصيد للصنف في هذا المستودع');
    }

    const available = Number(warehouseItem.available_qty);
    if (available < quantity) {
      throw new BadRequestException(
        `الكمية المتاحة (${available}) أقل من الكمية المطلوب حجزها (${quantity})`,
      );
    }

    return this.prisma.inv_warehouse_items.update({
      where: { id: warehouseItem.id },
      data: {
        reserved_qty: { increment: quantity },
        available_qty: { decrement: quantity },
      },
    });
  }

  async releaseReservation(warehouseId: string, itemId: string, quantity: number) {
    const warehouseItem = await this.prisma.inv_warehouse_items.findUnique({
      where: {
        warehouse_id_item_id: {
          warehouse_id: warehouseId,
          item_id: itemId,
        },
      },
    });

    if (!warehouseItem) {
      return;
    }

    const reserved = Number(warehouseItem.reserved_qty);
    const releaseQty = Math.min(reserved, quantity);

    return this.prisma.inv_warehouse_items.update({
      where: { id: warehouseItem.id },
      data: {
        reserved_qty: { decrement: releaseQty },
        available_qty: { increment: releaseQty },
      },
    });
  }

  async getAvailableStock(warehouseId: string, itemId: string): Promise<number> {
    const warehouseItem = await this.prisma.inv_warehouse_items.findUnique({
      where: {
        warehouse_id_item_id: {
          warehouse_id: warehouseId,
          item_id: itemId,
        },
      },
    });

    return warehouseItem ? Number(warehouseItem.available_qty) : 0;
  }

  async getTotalStock(itemId: string): Promise<number> {
    const result = await this.prisma.inv_warehouse_items.aggregate({
      where: { item_id: itemId },
      _sum: { quantity: true },
    });

    return Number(result._sum.quantity) || 0;
  }

  private async updateItemAvgCost(itemId: string, newCost: number, quantity: number) {
    const item = await this.prisma.inv_items.findUnique({
      where: { id: itemId },
    });

    if (!item) return;

    const currentAvgCost = Number(item.avg_cost);
    const totalStock = await this.getTotalStock(itemId);

    // Calculate new weighted average
    const oldValue = (totalStock - quantity) * currentAvgCost;
    const newValue = quantity * newCost;
    const newAvgCost = totalStock > 0 ? (oldValue + newValue) / totalStock : newCost;

    await this.prisma.inv_items.update({
      where: { id: itemId },
      data: {
        avg_cost: newAvgCost,
        last_cost: newCost,
      },
    });
  }
}
