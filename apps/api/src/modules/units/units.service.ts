import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto, UnitQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto) {
    const existing = await this.prisma.inv_units.findUnique({
      where: { code: createUnitDto.code },
    });

    if (existing) {
      throw new ConflictException(`وحدة القياس بالكود ${createUnitDto.code} موجودة مسبقاً`);
    }

    return this.prisma.inv_units.create({
      data: {
        code: createUnitDto.code,
        name: createUnitDto.name,
        name_en: createUnitDto.nameEn,
        symbol: createUnitDto.symbol,
        is_active: createUnitDto.isActive ?? true,
      },
    });
  }

  async findAll(query: UnitQueryDto) {
    const { search, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_unitsWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { symbol: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_units.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_units.count({ where }),
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
    const unit = await this.prisma.inv_units.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!unit) {
      throw new NotFoundException('وحدة القياس غير موجودة');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);

    if (updateUnitDto.code) {
      const existing = await this.prisma.inv_units.findFirst({
        where: {
          code: updateUnitDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`وحدة القياس بالكود ${updateUnitDto.code} موجودة مسبقاً`);
      }
    }

    return this.prisma.inv_units.update({
      where: { id },
      data: {
        code: updateUnitDto.code,
        name: updateUnitDto.name,
        name_en: updateUnitDto.nameEn,
        symbol: updateUnitDto.symbol,
        is_active: updateUnitDto.isActive,
      },
    });
  }

  async remove(id: string) {
    const unit = await this.findOne(id);

    if (unit.items && unit.items.length > 0) {
      throw new ConflictException('لا يمكن حذف وحدة قياس مرتبطة بأصناف');
    }

    return this.prisma.inv_units.delete({
      where: { id },
    });
  }
}
