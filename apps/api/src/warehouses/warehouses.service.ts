import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehousesDto } from './dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryWarehousesDto) {
    const { skip = 0, take = 20, search, type, isActive } = params;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (isActive !== undefined) {
      where.isActive = String(isActive) === 'true';
    }

    const [warehouses, total] = await Promise.all([
      this.prisma.invWarehouse.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          _count: { select: { stocks: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invWarehouse.count({ where }),
    ]);

    return { data: warehouses, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.invWarehouse.findUnique({
      where: { id },
      include: {
        stocks: {
          include: { item: true },
          take: 20,
        },
        _count: { select: { stocks: true, movementsFrom: true, movementsTo: true } },
      },
    });
    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }
    return warehouse;
  }

  async create(dto: CreateWarehouseDto) {
    const existing = await this.prisma.invWarehouse.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('كود المستودع موجود مسبقاً');
    }

    return this.prisma.invWarehouse.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.invWarehouse.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('كود المستودع موجود مسبقاً');
      }
    }

    return this.prisma.invWarehouse.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    
    if (warehouse._count.stocks > 0) {
      throw new ConflictException('لا يمكن حذف مستودع يحتوي على أرصدة');
    }

    return this.prisma.invWarehouse.delete({ where: { id } });
  }

  async getStock(id: string) {
    await this.findOne(id);
    
    const stocks = await this.prisma.invStock.findMany({
      where: { warehouseId: id },
      include: {
        item: {
          include: { category: true, unit: true },
        },
      },
      orderBy: { item: { name: 'asc' } },
    });

    return stocks;
  }
}
