import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto, UpdateItemDto, ItemQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createItemDto: CreateItemDto) {
    // Check if code already exists
    const existing = await this.prisma.inv_items.findUnique({
      where: { code: createItemDto.code },
    });

    if (existing) {
      throw new ConflictException(`الصنف بالكود ${createItemDto.code} موجود مسبقاً`);
    }

    // Verify category exists
    const category = await this.prisma.inv_categories.findUnique({
      where: { id: createItemDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // Verify unit exists
    const unit = await this.prisma.inv_units.findUnique({
      where: { id: createItemDto.unitId },
    });
    if (!unit) {
      throw new NotFoundException('وحدة القياس غير موجودة');
    }

    return this.prisma.inv_items.create({
      data: {
        code: createItemDto.code,
        name: createItemDto.name,
        name_en: createItemDto.nameEn,
        description: createItemDto.description,
        category_id: createItemDto.categoryId,
        unit_id: createItemDto.unitId,
        barcode: createItemDto.barcode,
        min_stock: createItemDto.minStock || 0,
        max_stock: createItemDto.maxStock,
        reorder_point: createItemDto.reorderPoint,
        reorder_qty: createItemDto.reorderQty,
        standard_cost: createItemDto.standardCost,
        is_serialized: createItemDto.isSerialized ?? false,
        is_active: createItemDto.isActive ?? true,
      },
      include: {
        category: true,
        unit: true,
      },
    });
  }

  async findAll(query: ItemQueryDto) {
    const { search, categoryId, unitId, isActive, lowStock, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_itemsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (unitId) {
      where.unit_id = unitId;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_items.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          unit: true,
          warehouse_items: {
            select: {
              quantity: true,
              available_qty: true,
              warehouse: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_items.count({ where }),
    ]);

    // Calculate total stock for each item
    const dataWithStock = data.map((item) => {
      const totalStock = item.warehouse_items.reduce(
        (sum, wi) => sum + Number(wi.quantity),
        0,
      );
      const availableStock = item.warehouse_items.reduce(
        (sum, wi) => sum + Number(wi.available_qty),
        0,
      );
      return {
        ...item,
        totalStock,
        availableStock,
        isLowStock: totalStock <= Number(item.min_stock),
      };
    });

    // Filter low stock items if requested
    const filteredData = lowStock
      ? dataWithStock.filter((item) => item.isLowStock)
      : dataWithStock;

    return {
      data: filteredData,
      meta: {
        total: lowStock ? filteredData.length : total,
        page,
        limit,
        totalPages: Math.ceil((lowStock ? filteredData.length : total) / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.inv_items.findUnique({
      where: { id },
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

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }

    // Calculate totals
    const totalStock = item.warehouse_items.reduce(
      (sum, wi) => sum + Number(wi.quantity),
      0,
    );
    const availableStock = item.warehouse_items.reduce(
      (sum, wi) => sum + Number(wi.available_qty),
      0,
    );
    const totalValue = item.warehouse_items.reduce(
      (sum, wi) => sum + Number(wi.quantity) * Number(wi.avg_cost),
      0,
    );

    return {
      ...item,
      totalStock,
      availableStock,
      totalValue,
      isLowStock: totalStock <= Number(item.min_stock),
    };
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    await this.findOne(id);

    // Check if code is being changed and if new code already exists
    if (updateItemDto.code) {
      const existing = await this.prisma.inv_items.findFirst({
        where: {
          code: updateItemDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`الصنف بالكود ${updateItemDto.code} موجود مسبقاً`);
      }
    }

    // Verify category if being changed
    if (updateItemDto.categoryId) {
      const category = await this.prisma.inv_categories.findUnique({
        where: { id: updateItemDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('التصنيف غير موجود');
      }
    }

    // Verify unit if being changed
    if (updateItemDto.unitId) {
      const unit = await this.prisma.inv_units.findUnique({
        where: { id: updateItemDto.unitId },
      });
      if (!unit) {
        throw new NotFoundException('وحدة القياس غير موجودة');
      }
    }

    return this.prisma.inv_items.update({
      where: { id },
      data: {
        code: updateItemDto.code,
        name: updateItemDto.name,
        name_en: updateItemDto.nameEn,
        description: updateItemDto.description,
        category_id: updateItemDto.categoryId,
        unit_id: updateItemDto.unitId,
        barcode: updateItemDto.barcode,
        min_stock: updateItemDto.minStock,
        max_stock: updateItemDto.maxStock,
        reorder_point: updateItemDto.reorderPoint,
        reorder_qty: updateItemDto.reorderQty,
        standard_cost: updateItemDto.standardCost,
        is_serialized: updateItemDto.isSerialized,
        is_active: updateItemDto.isActive,
      },
      include: {
        category: true,
        unit: true,
      },
    });
  }

  async remove(id: string) {
    const item = await this.findOne(id);

    // Check if item has stock
    if (item.totalStock > 0) {
      throw new ConflictException('لا يمكن حذف صنف له رصيد في المخزون');
    }

    return this.prisma.inv_items.delete({
      where: { id },
    });
  }

  async getStock(id: string) {
    await this.findOne(id);

    return this.prisma.inv_warehouse_items.findMany({
      where: { item_id: id },
      include: {
        warehouse: true,
      },
    });
  }

  async getMovements(id: string, page = 1, limit = 10) {
    await this.findOne(id);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inv_movement_items.findMany({
        where: { item_id: id },
        skip,
        take: limit,
        include: {
          movement: {
            include: {
              warehouse: true,
              to_warehouse: true,
            },
          },
        },
        orderBy: { movement: { movement_date: 'desc' } },
      }),
      this.prisma.inv_movement_items.count({ where: { item_id: id } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
