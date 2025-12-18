import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto, QuerySuppliersDto } from './dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QuerySuppliersDto) {
    const { skip = 0, take = 20, search, type, category, isActive } = params;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (category) where.category = category;
    if (isActive !== undefined) {
      where.isActive = String(isActive) === 'true';
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.invSupplier.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          _count: { select: { contracts: true, purchaseOrders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invSupplier.count({ where }),
    ]);

    return { data: suppliers, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.invSupplier.findUnique({
      where: { id },
      include: {
        contracts: { orderBy: { createdAt: 'desc' }, take: 10 },
        purchaseOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { contracts: true, purchaseOrders: true } },
      },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.prisma.invSupplier.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('كود المورد موجود مسبقاً');
    }

    return this.prisma.invSupplier.create({ data: dto });
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.invSupplier.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('كود المورد موجود مسبقاً');
      }
    }

    return this.prisma.invSupplier.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);
    
    if (supplier._count.purchaseOrders > 0) {
      throw new ConflictException('لا يمكن حذف مورد له أوامر شراء');
    }

    // حذف العقود أولاً
    await this.prisma.invSupplierContract.deleteMany({ where: { supplierId: id } });

    return this.prisma.invSupplier.delete({ where: { id } });
  }

  async getOrders(id: string) {
    await this.findOne(id);
    
    const orders = await this.prisma.invPurchaseOrder.findMany({
      where: { supplierId: id },
      include: {
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }
}
