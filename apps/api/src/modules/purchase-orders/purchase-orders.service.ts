import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from '../../common/services/sequence.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
  ) {}

  async create(createDto: CreatePurchaseOrderDto, userId: string) {
    // Validate supplier
    const supplier = await this.prisma.inv_suppliers.findUnique({
      where: { id: createDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    // Validate warehouse
    const warehouse = await this.prisma.inv_warehouses.findUnique({
      where: { id: createDto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }

    // Validate items
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('يجب إضافة عنصر واحد على الأقل');
    }

    // Generate PO number
    const orderNo = await this.sequenceService.getNextNumber('PO', 'PO');

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
        received_qty: 0,
        notes: item.notes,
      };
    });

    const netAmount = subtotal - totalDiscount;
    const taxAmount = netAmount * (taxPercent / 100);
    const totalAmount = netAmount + taxAmount;

    return this.prisma.inv_purchase_orders.create({
      data: {
        order_no: orderNo,
        quotation_id: createDto.quotationId,
        supplier_id: createDto.supplierId,
        warehouse_id: createDto.warehouseId,
        expected_date: createDto.expectedDate ? new Date(createDto.expectedDate) : null,
        payment_terms: createDto.paymentTerms,
        delivery_terms: createDto.deliveryTerms,
        subtotal,
        discount_amount: totalDiscount,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        status: 'draft',
        notes: createDto.notes,
        created_by: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
        supplier: true,
        warehouse: true,
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

  async createFromQuotation(quotationId: string, userId: string) {
    const quotation = await this.prisma.inv_quotations.findUnique({
      where: { id: quotationId },
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

    if (!quotation) {
      throw new NotFoundException('عرض السعر غير موجود');
    }

    if (quotation.status !== 'accepted') {
      throw new BadRequestException('يجب قبول عرض السعر أولاً');
    }

    // Check if PO already exists for this quotation
    const existingPO = await this.prisma.inv_purchase_orders.findFirst({
      where: { quotation_id: quotationId },
    });
    if (existingPO) {
      throw new ConflictException('يوجد أمر شراء لهذا العرض مسبقاً');
    }

    const createDto: CreatePurchaseOrderDto = {
      quotationId,
      supplierId: quotation.supplier_id,
      warehouseId: quotation.request.warehouse_id,
      paymentTerms: quotation.payment_terms || undefined,
      deliveryTerms: quotation.delivery_terms || undefined,
      taxPercent: Number(quotation.tax_percent),
      items: quotation.items.map((item) => ({
        itemId: item.item_id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
        discountPercent: Number(item.discount_percent),
      })),
    };

    return this.create(createDto, userId);
  }

  async findAll(query: PurchaseOrderQueryDto) {
    const { supplierId, warehouseId, status, fromDate, toDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_purchase_ordersWhereInput = {};

    if (supplierId) {
      where.supplier_id = supplierId;
    }

    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_purchase_orders.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: true,
          warehouse: true,
          items: {
            include: {
              item: {
                include: {
                  unit: true,
                },
              },
            },
          },
          _count: {
            select: { receipts: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_purchase_orders.count({ where }),
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
    const order = await this.prisma.inv_purchase_orders.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        quotation: {
          include: {
            request: true,
          },
        },
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
        receipts: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('أمر الشراء غير موجود');
    }

    return order;
  }

  async update(id: string, updateDto: UpdatePurchaseOrderDto) {
    const order = await this.findOne(id);

    if (order.status !== 'draft') {
      throw new ConflictException('لا يمكن تعديل أمر شراء معتمد أو مرسل');
    }

    if (updateDto.items) {
      await this.prisma.inv_purchase_order_items.deleteMany({
        where: { order_id: id },
      });

      const taxPercent = updateDto.taxPercent || Number(order.tax_percent);
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
          received_qty: 0,
          notes: item.notes,
        };
      });

      const netAmount = subtotal - totalDiscount;
      const taxAmount = netAmount * (taxPercent / 100);
      const totalAmount = netAmount + taxAmount;

      return this.prisma.inv_purchase_orders.update({
        where: { id },
        data: {
          supplier_id: updateDto.supplierId,
          warehouse_id: updateDto.warehouseId,
          expected_date: updateDto.expectedDate ? new Date(updateDto.expectedDate) : undefined,
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
          supplier: true,
          warehouse: true,
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    }

    return this.prisma.inv_purchase_orders.update({
      where: { id },
      data: {
        supplier_id: updateDto.supplierId,
        warehouse_id: updateDto.warehouseId,
        expected_date: updateDto.expectedDate ? new Date(updateDto.expectedDate) : undefined,
        payment_terms: updateDto.paymentTerms,
        delivery_terms: updateDto.deliveryTerms,
        notes: updateDto.notes,
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async approve(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status !== 'draft') {
      throw new ConflictException('الأمر معتمد مسبقاً');
    }

    return this.prisma.inv_purchase_orders.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: userId,
        approved_at: new Date(),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async send(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status !== 'approved') {
      throw new ConflictException('يجب اعتماد الأمر أولاً');
    }

    return this.prisma.inv_purchase_orders.update({
      where: { id },
      data: {
        status: 'sent',
        sent_at: new Date(),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string, reason?: string) {
    const order = await this.findOne(id);

    if (order.status === 'received') {
      throw new ConflictException('لا يمكن إلغاء أمر مستلم بالكامل');
    }

    if (order.receipts && order.receipts.length > 0) {
      throw new ConflictException('لا يمكن إلغاء أمر له محاضر استلام');
    }

    return this.prisma.inv_purchase_orders.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelled_by: userId,
        cancelled_at: new Date(),
        cancellation_reason: reason,
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }
}
