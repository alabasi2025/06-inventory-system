import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(createSupplierDto: CreateSupplierDto) {
    const existing = await this.prisma.inv_suppliers.findUnique({
      where: { code: createSupplierDto.code },
    });

    if (existing) {
      throw new ConflictException(`المورد بالكود ${createSupplierDto.code} موجود مسبقاً`);
    }

    return this.prisma.inv_suppliers.create({
      data: {
        code: createSupplierDto.code,
        name: createSupplierDto.name,
        name_en: createSupplierDto.nameEn,
        type: createSupplierDto.type,
        category: createSupplierDto.category,
        tax_number: createSupplierDto.taxNumber,
        cr_number: createSupplierDto.crNumber,
        phone: createSupplierDto.phone,
        mobile: createSupplierDto.mobile,
        email: createSupplierDto.email,
        website: createSupplierDto.website,
        address: createSupplierDto.address,
        city: createSupplierDto.city,
        country: createSupplierDto.country,
        contact_person: createSupplierDto.contactPerson,
        contact_phone: createSupplierDto.contactPhone,
        payment_terms: createSupplierDto.paymentTerms || 30,
        credit_limit: createSupplierDto.creditLimit || 0,
        notes: createSupplierDto.notes,
        is_active: createSupplierDto.isActive ?? true,
      },
    });
  }

  async findAll(query: SupplierQueryDto) {
    const { search, type, category, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_suppliersWhereInput = {};

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

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_suppliers.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              contracts: true,
              purchase_orders: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_suppliers.count({ where }),
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
    const supplier = await this.prisma.inv_suppliers.findUnique({
      where: { id },
      include: {
        contracts: {
          orderBy: { created_at: 'desc' },
        },
        purchase_orders: {
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    return supplier;
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    await this.findOne(id);

    if (updateSupplierDto.code) {
      const existing = await this.prisma.inv_suppliers.findFirst({
        where: {
          code: updateSupplierDto.code,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`المورد بالكود ${updateSupplierDto.code} موجود مسبقاً`);
      }
    }

    return this.prisma.inv_suppliers.update({
      where: { id },
      data: {
        code: updateSupplierDto.code,
        name: updateSupplierDto.name,
        name_en: updateSupplierDto.nameEn,
        type: updateSupplierDto.type,
        category: updateSupplierDto.category,
        tax_number: updateSupplierDto.taxNumber,
        cr_number: updateSupplierDto.crNumber,
        phone: updateSupplierDto.phone,
        mobile: updateSupplierDto.mobile,
        email: updateSupplierDto.email,
        website: updateSupplierDto.website,
        address: updateSupplierDto.address,
        city: updateSupplierDto.city,
        country: updateSupplierDto.country,
        contact_person: updateSupplierDto.contactPerson,
        contact_phone: updateSupplierDto.contactPhone,
        payment_terms: updateSupplierDto.paymentTerms,
        credit_limit: updateSupplierDto.creditLimit,
        notes: updateSupplierDto.notes,
        is_active: updateSupplierDto.isActive,
      },
    });
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);

    if (supplier.purchase_orders && supplier.purchase_orders.length > 0) {
      throw new ConflictException('لا يمكن حذف مورد له أوامر شراء');
    }

    return this.prisma.inv_suppliers.delete({
      where: { id },
    });
  }

  async getOrders(id: string, page = 1, limit = 10) {
    await this.findOne(id);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.inv_purchase_orders.findMany({
        where: { supplier_id: id },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              item: true,
            },
          },
          warehouse: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_purchase_orders.count({ where: { supplier_id: id } }),
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

  async getRating(id: string) {
    const supplier = await this.findOne(id);

    // Calculate rating based on various factors
    const orders = await this.prisma.inv_purchase_orders.findMany({
      where: { supplier_id: id, status: 'received' },
      include: {
        receipts: true,
      },
    });

    const totalOrders = orders.length;
    if (totalOrders === 0) {
      return {
        rating: null,
        totalOrders: 0,
        onTimeDelivery: 0,
        qualityScore: 0,
      };
    }

    // Calculate on-time delivery rate
    const onTimeOrders = orders.filter((order) => {
      if (!order.expected_date || order.receipts.length === 0) return true;
      const lastReceipt = order.receipts[order.receipts.length - 1];
      return lastReceipt.receipt_date <= order.expected_date;
    }).length;

    const onTimeDelivery = (onTimeOrders / totalOrders) * 100;

    // Simple rating calculation (can be enhanced)
    const rating = Math.min(5, (onTimeDelivery / 20));

    return {
      rating: Number(rating.toFixed(2)),
      totalOrders,
      onTimeDelivery: Number(onTimeDelivery.toFixed(2)),
      qualityScore: 100, // Placeholder - can be calculated from returns/complaints
    };
  }

  async updateRating(id: string) {
    const ratingData = await this.getRating(id);
    
    if (ratingData.rating !== null) {
      await this.prisma.inv_suppliers.update({
        where: { id },
        data: { rating: ratingData.rating },
      });
    }

    return ratingData;
  }
}
