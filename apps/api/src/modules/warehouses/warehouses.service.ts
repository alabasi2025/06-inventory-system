import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    const existing = await this.prisma.inv_warehouses.findUnique({
      where: { code: createWarehouseDto.code },
    });

    if (existing) {
      throw new ConflictException(`المستودع بالكود ${createWarehouseDto.code} موجود مسبقاً`);
    }

    return this.prisma.inv_warehouses.create({
      data: {
        code: createWarehouseDto.code,
        name: createWarehouseDto.name,
        name_en: createWarehouseDto.nameEn,
        type: createWarehouseDto.type,
        station_id: createWarehouseDto.stationId,
        address: createWarehouseDto.address,
        manager_id: createWarehouseDto.managerId,
        phone: createWarehouseDto.phone,
        email: createWarehouseDto.email,
        is_active: createWarehouseDto.isActive ?? true,
      },
    });
  }

  async findAll(query: WarehouseQueryDto) {
    const { search, type, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_warehousesWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_warehouses.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              warehouse_items: true,
              movements_from: true,
              purchase_orders: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_warehouses.count({ where }),
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

  async findOne(id: string) {
    const warehouse = await this.prisma.inv_warehouses.findUnique({
      where: { id },
      include: {
        warehouse_items: {
          include: {
            item: true,
          },
        },
        _count: {
          select: {
            movements_from: true,
            purchase_orders: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    await this.findOne(id);

    if (updateWarehouseDto.code) {
      const existing = await this.prisma.inv_warehouses.findFirst({
        where: {
          code: updateWarehouseDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`المستودع بالكود ${updateWarehouseDto.code} موجود مسبقاً`);
      }
    }

    return this.prisma.inv_warehouses.update({
      where: { id },
      data: {
        code: updateWarehouseDto.code,
        name: updateWarehouseDto.name,
        name_en: updateWarehouseDto.nameEn,
        type: updateWarehouseDto.type,
        station_id: updateWarehouseDto.stationId,
        address: updateWarehouseDto.address,
        manager_id: updateWarehouseDto.managerId,
        phone: updateWarehouseDto.phone,
        email: updateWarehouseDto.email,
        is_active: updateWarehouseDto.isActive,
      },
    });
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);

    // Check if warehouse has stock
    if (warehouse.warehouse_items && warehouse.warehouse_items.length > 0) {
      const hasStock = warehouse.warehouse_items.some(
        (item) => Number(item.quantity) > 0,
      );
      if (hasStock) {
        throw new ConflictException('لا يمكن حذف مستودع يحتوي على أرصدة');
      }
    }

    return this.prisma.inv_warehouses.delete({
      where: { id },
    });
  }

  async getStock(id: string) {
    await this.findOne(id);

    return this.prisma.inv_warehouse_items.findMany({
      where: { warehouse_id: id },
      include: {
        item: {
          include: {
            category: true,
            unit: true,
          },
        },
      },
      orderBy: { item: { name: 'asc' } },
    });
  }

  async getStockSummary(id: string) {
    await this.findOne(id);

    const items = await this.prisma.inv_warehouse_items.findMany({
      where: { warehouse_id: id },
      include: {
        item: true,
      },
    });

    const totalItems = items.length;
    const totalQuantity = items.reduce(
      (sum, item) => sum + Number(item.quantity),
      0,
    );
    const totalValue = items.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.avg_cost),
      0,
    );
    const lowStockItems = items.filter(
      (item) => Number(item.quantity) <= Number(item.item.min_stock),
    ).length;

    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockItems,
    };
  }
}
