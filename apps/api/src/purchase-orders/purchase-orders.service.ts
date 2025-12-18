import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrdersDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  private async generateOrderNo(): Promise<string> {
    const today = new Date();
    const prefix = `PO${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastOrder = await this.prisma.invPurchaseOrder.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' },
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNo.slice(-4));
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  async findAll(params: QueryPurchaseOrdersDto) {
    const { skip = 0, take = 20, supplierId, status, fromDate, toDate } = params;
    
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (fromDate || toDate) {
      where.orderDate = {};
      if (fromDate) where.orderDate.gte = new Date(fromDate);
      if (toDate) where.orderDate.lte = new Date(toDate);
    }

    const [orders, total] = await Promise.all([
      this.prisma.invPurchaseOrder.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          supplier: true,
          items: { include: { item: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invPurchaseOrder.count({ where }),
    ]);

    return { data: orders, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const order = await this.prisma.invPurchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: { item: { include: { unit: true } } },
        },
      },
    });
    if (!order) {
      throw new NotFoundException('أمر الشراء غير موجود');
    }
    return order;
  }

  async create(dto: CreatePurchaseOrderDto) {
    // التحقق من وجود المورد
    const supplier = await this.prisma.invSupplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    // التحقق من وجود الأصناف
    for (const item of dto.items) {
      const exists = await this.prisma.invItem.findUnique({ where: { id: item.itemId } });
      if (!exists) {
        throw new NotFoundException(`الصنف ${item.itemId} غير موجود`);
      }
    }

    const orderNo = await this.generateOrderNo();

    // حساب المبالغ
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalDiscount = new Decimal(0);

    const itemsData = dto.items.map(item => {
      const qty = new Decimal(item.quantity);
      const price = new Decimal(item.unitPrice);
      const taxRate = new Decimal(item.taxRate || 15);
      const discountRate = new Decimal(item.discountRate || 0);

      const lineTotal = qty.times(price);
      const discountAmount = lineTotal.times(discountRate).div(100);
      const taxableAmount = lineTotal.minus(discountAmount);
      const taxAmount = taxableAmount.times(taxRate).div(100);
      const totalAmount = taxableAmount.plus(taxAmount);

      subtotal = subtotal.plus(lineTotal);
      totalTax = totalTax.plus(taxAmount);
      totalDiscount = totalDiscount.plus(discountAmount);

      return {
        itemId: item.itemId,
        quantity: qty,
        unitPrice: price,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        totalAmount,
        notes: item.notes,
      };
    });

    const totalAmount = subtotal.minus(totalDiscount).plus(totalTax);

    const order = await this.prisma.invPurchaseOrder.create({
      data: {
        orderNo,
        supplierId: dto.supplierId,
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : null,
        warehouseId: dto.warehouseId,
        paymentTerms: dto.paymentTerms || supplier.paymentTerms,
        currency: dto.currency || 'SAR',
        subtotal,
        taxAmount: totalTax,
        discountAmount: totalDiscount,
        totalAmount,
        notes: dto.notes,
        createdBy: dto.createdBy,
        items: { create: itemsData },
      },
      include: {
        supplier: true,
        items: { include: { item: true } },
      },
    });

    return order;
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    const order = await this.findOne(id);
    
    if (!['draft', 'pending'].includes(order.status)) {
      throw new ConflictException('لا يمكن تعديل أمر شراء معتمد أو مرسل');
    }

    // تحديث البنود إذا تم تقديمها
    if (dto.items) {
      // حذف البنود القديمة
      await this.prisma.invPurchaseOrderItem.deleteMany({ where: { orderId: id } });
      
      // حساب المبالغ الجديدة
      let subtotal = new Decimal(0);
      let totalTax = new Decimal(0);
      let totalDiscount = new Decimal(0);

      const itemsData = dto.items.map(item => {
        const qty = new Decimal(item.quantity);
        const price = new Decimal(item.unitPrice);
        const taxRate = new Decimal(item.taxRate || 15);
        const discountRate = new Decimal(item.discountRate || 0);

        const lineTotal = qty.times(price);
        const discountAmount = lineTotal.times(discountRate).div(100);
        const taxableAmount = lineTotal.minus(discountAmount);
        const taxAmount = taxableAmount.times(taxRate).div(100);
        const totalAmount = taxableAmount.plus(taxAmount);

        subtotal = subtotal.plus(lineTotal);
        totalTax = totalTax.plus(taxAmount);
        totalDiscount = totalDiscount.plus(discountAmount);

        return {
          orderId: id,
          itemId: item.itemId,
          quantity: qty,
          unitPrice: price,
          taxRate,
          taxAmount,
          discountRate,
          discountAmount,
          totalAmount,
          notes: item.notes,
        };
      });

      await this.prisma.invPurchaseOrderItem.createMany({ data: itemsData });

      const totalAmount = subtotal.minus(totalDiscount).plus(totalTax);

      return this.prisma.invPurchaseOrder.update({
        where: { id },
        data: {
          expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
          notes: dto.notes,
          subtotal,
          taxAmount: totalTax,
          discountAmount: totalDiscount,
          totalAmount,
        },
        include: {
          supplier: true,
          items: { include: { item: true } },
        },
      });
    }

    return this.prisma.invPurchaseOrder.update({
      where: { id },
      data: {
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        notes: dto.notes,
      },
      include: {
        supplier: true,
        items: { include: { item: true } },
      },
    });
  }

  async approve(id: string, approvedBy: string) {
    const order = await this.findOne(id);
    
    if (order.status !== 'pending') {
      throw new ConflictException('يجب أن يكون الأمر في حالة انتظار الموافقة');
    }

    return this.prisma.invPurchaseOrder.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
      include: { supplier: true, items: { include: { item: true } } },
    });
  }

  async send(id: string) {
    const order = await this.findOne(id);
    
    if (order.status !== 'approved') {
      throw new ConflictException('يجب اعتماد الأمر قبل إرساله للمورد');
    }

    return this.prisma.invPurchaseOrder.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
      include: { supplier: true, items: { include: { item: true } } },
    });
  }

  async receive(id: string, warehouseId: string, receivedBy: string) {
    const order = await this.findOne(id);
    
    if (!['sent', 'partial'].includes(order.status)) {
      throw new ConflictException('لا يمكن استلام أمر غير مرسل');
    }

    // إنشاء حركة استلام
    const movementNo = `RCV${order.orderNo}`;
    
    await this.prisma.invMovement.create({
      data: {
        movementNo,
        type: 'receipt',
        toWarehouseId: warehouseId,
        referenceType: 'PO',
        referenceId: order.id,
        status: 'confirmed',
        totalAmount: order.totalAmount,
        createdBy: receivedBy,
        confirmedBy: receivedBy,
        confirmedAt: new Date(),
        items: {
          create: order.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitCost: item.unitPrice,
            totalCost: item.totalAmount,
          })),
        },
      },
    });

    // تحديث أرصدة المخزون
    for (const item of order.items) {
      const existing = await this.prisma.invStock.findUnique({
        where: { warehouseId_itemId: { warehouseId, itemId: item.itemId } },
      });

      if (existing) {
        const newQty = new Decimal(existing.quantity).plus(item.quantity);
        const newAvgCost = new Decimal(existing.avgCost)
          .times(existing.quantity)
          .plus(new Decimal(item.unitPrice).times(item.quantity))
          .div(newQty);

        await this.prisma.invStock.update({
          where: { id: existing.id },
          data: { quantity: newQty, avgCost: newAvgCost, lastUpdated: new Date() },
        });
      } else {
        await this.prisma.invStock.create({
          data: {
            warehouseId,
            itemId: item.itemId,
            quantity: item.quantity,
            avgCost: item.unitPrice,
          },
        });
      }

      // تحديث الكمية المستلمة
      await this.prisma.invPurchaseOrderItem.update({
        where: { id: item.id },
        data: { receivedQty: item.quantity },
      });
    }

    return this.prisma.invPurchaseOrder.update({
      where: { id },
      data: { status: 'received' },
      include: { supplier: true, items: { include: { item: true } } },
    });
  }
}
