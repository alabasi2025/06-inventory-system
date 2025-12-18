import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoriesDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: QueryCategoriesDto) {
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

    const [categories, total] = await Promise.all([
      this.prisma.invCategory.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          parent: true,
          children: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invCategory.count({ where }),
    ]);

    return { data: categories, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const category = await this.prisma.invCategory.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        items: { take: 10 },
        _count: { select: { items: true, children: true } },
      },
    });
    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }
    return category;
  }

  async create(dto: CreateCategoryDto) {
    // التحقق من عدم تكرار الكود
    const existing = await this.prisma.invCategory.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('كود التصنيف موجود مسبقاً');
    }

    // التحقق من وجود التصنيف الأب إذا تم تحديده
    if (dto.parentId) {
      const parent = await this.prisma.invCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }
    }

    return this.prisma.invCategory.create({
      data: dto,
      include: { parent: true },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    // التحقق من عدم تكرار الكود إذا تم تغييره
    if (dto.code) {
      const existing = await this.prisma.invCategory.findFirst({
        where: { code: dto.code, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('كود التصنيف موجود مسبقاً');
      }
    }

    // التحقق من وجود التصنيف الأب إذا تم تحديده
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('لا يمكن أن يكون التصنيف أباً لنفسه');
      }
      const parent = await this.prisma.invCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }
    }

    return this.prisma.invCategory.update({
      where: { id },
      data: dto,
      include: { parent: true },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    
    // التحقق من عدم وجود تصنيفات فرعية
    if (category._count.children > 0) {
      throw new ConflictException('لا يمكن حذف تصنيف يحتوي على تصنيفات فرعية');
    }
    
    // التحقق من عدم وجود أصناف مرتبطة
    if (category._count.items > 0) {
      throw new ConflictException('لا يمكن حذف تصنيف يحتوي على أصناف');
    }

    return this.prisma.invCategory.delete({ where: { id } });
  }

  async getTree() {
    const categories = await this.prisma.invCategory.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          include: {
            children: true,
            _count: { select: { items: true } },
          },
        },
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    });
    return categories;
  }
}
