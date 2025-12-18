import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto, UpdateItemDto, QueryItemsDto } from './dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryItemsDto) {
    const { skip = 0, take = 20, search, categoryId, isActive } = params;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) {
      where.isActive = String(isActive) === 'true';
    }

    const [items, total] = await Promise.all([
      this.prisma.invItem.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          category: true,
          unit: true,
          stocks: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invItem.count({ where }),
    ]);

    // حساب إجمالي الكمية لكل صنف
    const itemsWithTotalStock = items.map(item => ({
      ...item,
      totalStock: item.stocks.reduce((sum, stock) => sum + Number(stock.quantity), 0),
    }));

    return { data: itemsWithTotalStock, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const item = await this.prisma.invItem.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        stocks: {
          include: { warehouse: true },
        },
      },
    });
    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }
    return {
      ...item,
      totalStock: item.stocks.reduce((sum, stock) => sum + Number(stock.quantity), 0),
    };
  }

  async create(dto: CreateItemDto) {
    // التحقق من عدم تكرار الكود
    const existingCode = await this.prisma.invItem.findUnique({
      where: { code: dto.code },
    });
    if (existingCode) {
      throw new ConflictException('كود الصنف موجود مسبقاً');
    }

    // التحقق من عدم تكرار الباركود
    if (dto.barcode) {
      const existingBarcode = await this.prisma.invItem.findUnique({
        where: { barcode: dto.barcode },
      });
      if (existingBarcode) {
        throw new ConflictException('الباركود موجود مسبقاً');
      }
    }

    // التحقق من وجود التصنيف
    const category = await this.prisma.invCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    // التحقق من وجود الوحدة
    const unit = await this.prisma.invUnit.findUnique({
      where: { id: dto.unitId },
    });
    if (!unit) {
      throw new NotFoundException('وحدة القياس غير موجودة');
    }

    return this.prisma.invItem.create({
      data: dto,
      include: { category: true, unit: true },
    });
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.invItem.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('كود الصنف موجود مسبقاً');
      }
    }

    if (dto.barcode) {
      const existing = await this.prisma.invItem.findFirst({
        where: { barcode: dto.barcode, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('الباركود موجود مسبقاً');
      }
    }

    if (dto.categoryId) {
      const category = await this.prisma.invCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('التصنيف غير موجود');
      }
    }

    if (dto.unitId) {
      const unit = await this.prisma.invUnit.findUnique({
        where: { id: dto.unitId },
      });
      if (!unit) {
        throw new NotFoundException('وحدة القياس غير موجودة');
      }
    }

    return this.prisma.invItem.update({
      where: { id },
      data: dto,
      include: { category: true, unit: true },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.invItem.findUnique({
      where: { id },
      include: {
        stocks: true,
        movementItems: { take: 1 },
      },
    });

    if (!item) {
      throw new NotFoundException('الصنف غير موجود');
    }

    // التحقق من عدم وجود أرصدة
    const hasStock = item.stocks.some(s => Number(s.quantity) > 0);
    if (hasStock) {
      throw new ConflictException('لا يمكن حذف صنف له رصيد في المخزون');
    }

    // التحقق من عدم وجود حركات
    if (item.movementItems.length > 0) {
      throw new ConflictException('لا يمكن حذف صنف له حركات مخزون');
    }

    // حذف الأرصدة الصفرية
    await this.prisma.invStock.deleteMany({ where: { itemId: id } });

    return this.prisma.invItem.delete({ where: { id } });
  }

  async getStock(id: string) {
    await this.findOne(id);
    
    const stocks = await this.prisma.invStock.findMany({
      where: { itemId: id },
      include: { warehouse: true },
    });

    return stocks;
  }

  async getMovements(id: string) {
    await this.findOne(id);
    
    const movements = await this.prisma.invMovementItem.findMany({
      where: { itemId: id },
      include: {
        movement: {
          include: {
            fromWarehouse: true,
            toWarehouse: true,
          },
        },
      },
      orderBy: { movement: { movementDate: 'desc' } },
      take: 50,
    });

    return movements;
  }
}
