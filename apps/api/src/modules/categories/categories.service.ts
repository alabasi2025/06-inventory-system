import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if code already exists
    const existing = await this.prisma.inv_categories.findUnique({
      where: { code: createCategoryDto.code },
    });

    if (existing) {
      throw new ConflictException(`التصنيف بالكود ${createCategoryDto.code} موجود مسبقاً`);
    }

    // If parent is specified, verify it exists
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.inv_categories.findUnique({
        where: { id: createCategoryDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }
    }

    return this.prisma.inv_categories.create({
      data: {
        code: createCategoryDto.code,
        name: createCategoryDto.name,
        name_en: createCategoryDto.nameEn,
        parent_id: createCategoryDto.parentId,
        level: createCategoryDto.level || 1,
        is_active: createCategoryDto.isActive ?? true,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(query: CategoryQueryDto) {
    const { search, parentId, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_categoriesWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { name_en: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (parentId) {
      where.parent_id = parentId;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_categories.findMany({
        where,
        skip,
        take: limit,
        include: {
          parent: true,
          children: true,
          _count: {
            select: { items: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_categories.count({ where }),
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
    const category = await this.prisma.inv_categories.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundException('التصنيف غير موجود');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists
    await this.findOne(id);

    // Check if code is being changed and if new code already exists
    if (updateCategoryDto.code) {
      const existing = await this.prisma.inv_categories.findFirst({
        where: {
          code: updateCategoryDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`التصنيف بالكود ${updateCategoryDto.code} موجود مسبقاً`);
      }
    }

    // If parent is being changed, verify it exists
    if (updateCategoryDto.parentId) {
      const parent = await this.prisma.inv_categories.findUnique({
        where: { id: updateCategoryDto.parentId },
      });
      if (!parent) {
        throw new NotFoundException('التصنيف الأب غير موجود');
      }
      // Prevent circular reference
      if (updateCategoryDto.parentId === id) {
        throw new ConflictException('لا يمكن تعيين التصنيف كأب لنفسه');
      }
    }

    return this.prisma.inv_categories.update({
      where: { id },
      data: {
        code: updateCategoryDto.code,
        name: updateCategoryDto.name,
        name_en: updateCategoryDto.nameEn,
        parent_id: updateCategoryDto.parentId,
        level: updateCategoryDto.level,
        is_active: updateCategoryDto.isActive,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new ConflictException('لا يمكن حذف تصنيف له تصنيفات فرعية');
    }

    // Check if category has items
    if (category.items && category.items.length > 0) {
      throw new ConflictException('لا يمكن حذف تصنيف مرتبط بأصناف');
    }

    return this.prisma.inv_categories.delete({
      where: { id },
    });
  }

  async getTree() {
    const categories = await this.prisma.inv_categories.findMany({
      where: { parent_id: null, is_active: true },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }
}
