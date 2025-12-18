import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, QueryUnitsDto } from './dto';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryUnitsDto) {
    const { skip = 0, take = 20, search, isActive } = params;
    
    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { nameEn: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = String(isActive) === 'true';
    }

    const [units, total] = await Promise.all([
      this.prisma.invUnit.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invUnit.count({ where }),
    ]);

    return { data: units, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const unit = await this.prisma.invUnit.findUnique({
      where: { id },
      include: {
        _count: { select: { items: true } },
      },
    });
    if (!unit) {
      throw new NotFoundException('وحدة القياس غير موجودة');
    }
    return unit;
  }

  async create(dto: CreateUnitDto) {
    const existing = await this.prisma.invUnit.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('كود الوحدة موجود مسبقاً');
    }

    return this.prisma.invUnit.create({ data: dto });
  }

  async update(id: string, dto: UpdateUnitDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.invUnit.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('كود الوحدة موجود مسبقاً');
      }
    }

    return this.prisma.invUnit.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const unit = await this.findOne(id);
    
    if (unit._count.items > 0) {
      throw new ConflictException('لا يمكن حذف وحدة قياس مرتبطة بأصناف');
    }

    return this.prisma.invUnit.delete({ where: { id } });
  }
}
