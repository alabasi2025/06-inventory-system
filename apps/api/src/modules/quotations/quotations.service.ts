import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from '../../common/services/sequence.service';
import { CreateQuotationDto, UpdateQuotationDto, QuotationQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class QuotationsService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
  ) {}

  async create(createDto: CreateQuotationDto, userId: string) {
    // Validate purchase request if provided
    if (createDto.requestId) {
      const request = await this.prisma.inv_purchase_requests.findUnique({
        where: { id: createDto.requestId },
      });
      if (!request) {
        throw new NotFoundException('طلب الشراء غير موجود');
      }
      if (request.status !== 'approved') {
        throw new BadRequestException('يجب أن يكون طلب الشراء معتمداً');
      }
    }

    // Validate supplier
    const supplier = await this.prisma.inv_suppliers.findUnique({
      where: { id: createDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    // Validate items
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('يجب إضافة عنصر واحد على الأقل');
    }

    // Generate quotation number
    const quotationNo = await this.sequenceService.getNextNumber('QT', 'QT');

    // Calculate totals
    const taxPercent = createDto.taxPercent || 15;
    let subtotal = 0;
    let totalDiscount = 0;

    const itemsData = createDto.items.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const discount = lineTotal * ((item.discountPercent || 0) / 100);
      subtotal += lineTotal;
      totalDiscount += discount;

      return {
        item_id: item.itemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent || 0,
        discount_amount: discount,
        total_price: lineTotal - discount,
        delivery_days: item.deliveryDays,
        notes: item.notes,
      };
    });

    const netAmount = subtotal - totalDiscount;
    const taxAmount = netAmount * (taxPercent / 100);
    const totalAmount = netAmount + taxAmount;

    return this.prisma.inv_quotations.create({
      data: {
        quotation_no: quotationNo,
        request_id: createDto.requestId,
        supplier_id: createDto.supplierId,
        valid_until: createDto.validUntil ? new Date(createDto.validUntil) : null,
        payment_terms: createDto.paymentTerms,
        delivery_terms: createDto.deliveryTerms,
        subtotal,
        discount_amount: totalDiscount,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'pending',
        notes: createDto.notes,
        created_by: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        request: true,
        supplier: true,
        items: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: QuotationQueryDto) {
    const { requestId, supplierId, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_quotationsWhereInput = {};

    if (requestId) {
      where.request_id = requestId;
    }

    if (supplierId) {
      where.supplier_id = supplierId;
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_quotations.findMany({
        where,
        skip,
        take: limit,
        include: {
          request: true,
          supplier: true,
          items: {
            include: {
              item: {
                include: {
                  unit: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_quotations.count({ where }),
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
    const quotation = await this.prisma.inv_quotations.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            warehouse: true,
            items: {
              include: {
                item: true,
              },
            },
          },
        },
        supplier: true,
        items: {
          include: {
            item: {
              include: {
                unit: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException('عرض السعر غير موجود');
    }

    return quotation;
  }

  async update(id: string, updateDto: UpdateQuotationDto) {
    const quotation = await this.findOne(id);

    if (quotation.status !== 'pending' && quotation.status !== 'received') {
      throw new ConflictException('لا يمكن تعديل عرض سعر مقبول أو مرفوض');
    }

    // If items are being updated
    if (updateDto.items) {
      await this.prisma.inv_quotation_items.deleteMany({
        where: { quotation_id: id },
      });

      const taxPercent = updateDto.taxPercent || Number(quotation.tax_percent);
      let subtotal = 0;
      let totalDiscount = 0;

      const itemsData = updateDto.items.map((item) => {
        const lineTotal = item.quantity * item.unitPrice;
        const discount = lineTotal * ((item.discountPercent || 0) / 100);
        subtotal += lineTotal;
        totalDiscount += discount;

        return {
          item_id: item.itemId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent || 0,
          discount_amount: discount,
          total_price: lineTotal - discount,
          delivery_days: item.deliveryDays,
          notes: item.notes,
        };
      });

      const netAmount = subtotal - totalDiscount;
      const taxAmount = netAmount * (taxPercent / 100);
      const totalAmount = netAmount + taxAmount;

      return this.prisma.inv_quotations.update({
        where: { id },
        data: {
          valid_until: updateDto.validUntil ? new Date(updateDto.validUntil) : undefined,
          payment_terms: updateDto.paymentTerms,
          delivery_terms: updateDto.deliveryTerms,
          subtotal,
          discount_amount: totalDiscount,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          notes: updateDto.notes,
          items: {
            create: itemsData,
          },
        },
        include: {
          request: true,
          supplier: true,
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    }

    return this.prisma.inv_quotations.update({
      where: { id },
      data: {
        valid_until: updateDto.validUntil ? new Date(updateDto.validUntil) : undefined,
        payment_terms: updateDto.paymentTerms,
        delivery_terms: updateDto.deliveryTerms,
        notes: updateDto.notes,
      },
      include: {
        request: true,
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async markReceived(id: string) {
    const quotation = await this.findOne(id);

    if (quotation.status !== 'pending') {
      throw new ConflictException('العرض ليس في حالة انتظار');
    }

    return this.prisma.inv_quotations.update({
      where: { id },
      data: {
        status: 'received',
        received_at: new Date(),
      },
      include: {
        request: true,
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async accept(id: string, userId: string) {
    const quotation = await this.findOne(id);

    if (quotation.status !== 'received' && quotation.status !== 'pending') {
      throw new ConflictException('لا يمكن قبول هذا العرض');
    }

    // Reject other quotations for the same request if exists
    if (quotation.request_id) {
      await this.prisma.inv_quotations.updateMany({
        where: {
          request_id: quotation.request_id,
          id: { not: id },
          status: { in: ['pending', 'received'] },
        },
        data: {
          status: 'rejected',
        },
      });
    }

    return this.prisma.inv_quotations.update({
      where: { id },
      data: {
        status: 'accepted',
        accepted_by: userId,
        accepted_at: new Date(),
      },
      include: {
        request: true,
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async reject(id: string, userId: string, reason?: string) {
    const quotation = await this.findOne(id);

    if (quotation.status === 'accepted') {
      throw new ConflictException('لا يمكن رفض عرض مقبول');
    }

    return this.prisma.inv_quotations.update({
      where: { id },
      data: {
        status: 'rejected',
        notes: reason ? `سبب الرفض: ${reason}` : quotation.notes,
      },
      include: {
        request: true,
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async compareQuotations(requestId: string) {
    const quotations = await this.prisma.inv_quotations.findMany({
      where: { request_id: requestId },
      include: {
        supplier: true,
        items: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { total_amount: 'asc' },
    });

    // Build comparison matrix
    const items = new Map<string, any>();
    
    for (const quotation of quotations) {
      for (const qItem of quotation.items) {
        if (!items.has(qItem.item_id)) {
          items.set(qItem.item_id, {
            item: qItem.item,
            suppliers: [],
          });
        }
        items.get(qItem.item_id).suppliers.push({
          supplierId: quotation.supplier_id,
          supplierName: quotation.supplier.name,
          quotationId: quotation.id,
          unitPrice: qItem.unit_price,
          discountPercent: qItem.discount_percent,
          totalPrice: qItem.total_price,
          deliveryDays: qItem.delivery_days,
        });
      }
    }

    return {
      quotations,
      comparison: Array.from(items.values()),
      lowestTotal: quotations[0],
    };
  }
}
