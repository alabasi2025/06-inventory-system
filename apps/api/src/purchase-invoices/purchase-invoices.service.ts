import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PurchaseInvoicesService {
  constructor(private prisma: PrismaService) {}

  // توليد رقم فاتورة جديد
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invPurchaseInvoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}`,
        },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `INV-${year}-${sequence.toString().padStart(5, '0')}`;
  }

  // حساب مجاميع الفاتورة
  private calculateTotals(items: any[]): { subtotal: number; taxAmount: number; discountAmount: number; totalAmount: number } {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountRate || 0) / 100;
      const lineAfterDiscount = lineTotal - lineDiscount;
      const lineTax = lineAfterDiscount * (item.taxRate || 0) / 100;

      subtotal += lineTotal;
      discountAmount += lineDiscount;
      taxAmount += lineTax;
    }

    const totalAmount = subtotal - discountAmount + taxAmount;

    return { subtotal, taxAmount, discountAmount, totalAmount };
  }

  async findAll(params?: { status?: string; supplierId?: string; search?: string }) {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.supplierId) {
      where.supplierId = params.supplierId;
    }

    if (params?.search) {
      where.OR = [
        { invoiceNumber: { contains: params.search, mode: 'insensitive' } },
        { supplierInvoiceNumber: { contains: params.search, mode: 'insensitive' } },
        { supplier: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.invPurchaseInvoice.findMany({
      where,
      include: {
        supplier: true,
        purchaseOrder: true,
        grn: true,
        items: {
          include: {
            item: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invPurchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseOrder: true,
        grn: true,
        items: {
          include: {
            item: {
              include: {
                unit: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('الفاتورة غير موجودة');
    }

    return invoice;
  }

  async create(dto: CreatePurchaseInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();

    // حساب المجاميع
    const totals = dto.items ? this.calculateTotals(dto.items) : { subtotal: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0 };

    return this.prisma.invPurchaseInvoice.create({
      data: {
        invoiceNumber,
        supplierInvoiceNumber: dto.supplierInvoiceNumber,
        invoiceDate: new Date(dto.invoiceDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        grnId: dto.grnId,
        currency: dto.currency || 'YER',
        exchangeRate: dto.exchangeRate || 1,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        totalAmount: totals.totalAmount,
        remainingAmount: totals.totalAmount,
        items: dto.items ? {
          create: dto.items.map(item => {
            const lineTotal = item.quantity * item.unitPrice;
            const lineDiscount = lineTotal * (item.discountRate || 0) / 100;
            const lineAfterDiscount = lineTotal - lineDiscount;
            const lineTax = lineAfterDiscount * (item.taxRate || 0) / 100;
            const itemTotal = lineAfterDiscount + lineTax;

            return {
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate || 0,
              taxAmount: lineTax,
              discountRate: item.discountRate || 0,
              discountAmount: lineDiscount,
              totalAmount: itemTotal,
            };
          }),
        } : undefined,
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdatePurchaseInvoiceDto) {
    const invoice = await this.findOne(id);

    if (invoice.status === 'paid') {
      throw new BadRequestException('لا يمكن تعديل فاتورة مدفوعة');
    }

    // إذا تم تحديث البنود، نعيد حساب المجاميع
    let totals = { subtotal: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0 };
    if (dto.items) {
      totals = this.calculateTotals(dto.items);
    }

    return this.prisma.invPurchaseInvoice.update({
      where: { id },
      data: {
        supplierInvoiceNumber: dto.supplierInvoiceNumber,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId,
        grnId: dto.grnId,
        currency: dto.currency,
        exchangeRate: dto.exchangeRate,
        paymentTerms: dto.paymentTerms,
        notes: dto.notes,
        status: dto.status,
        ...(dto.items && {
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          totalAmount: totals.totalAmount,
          remainingAmount: totals.totalAmount - Number(invoice.paidAmount),
        }),
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'draft') {
      throw new BadRequestException('لا يمكن حذف فاتورة غير مسودة');
    }

    return this.prisma.invPurchaseInvoice.delete({
      where: { id },
    });
  }

  async post(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'draft') {
      throw new BadRequestException('الفاتورة مُرحّلة بالفعل');
    }

    return this.prisma.invPurchaseInvoice.update({
      where: { id },
      data: {
        status: 'posted',
        postedAt: new Date(),
      },
      include: {
        supplier: true,
        items: true,
      },
    });
  }

  async addPayment(id: string, paymentData: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string }) {
    const invoice = await this.findOne(id);

    if (invoice.status === 'draft') {
      throw new BadRequestException('يجب ترحيل الفاتورة أولاً');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('الفاتورة مدفوعة بالكامل');
    }

    const remainingAmount = Number(invoice.remainingAmount);
    if (paymentData.amount > remainingAmount) {
      throw new BadRequestException(`المبلغ أكبر من المتبقي (${remainingAmount})`);
    }

    // توليد رقم الدفعة
    const year = new Date().getFullYear();
    const lastPayment = await this.prisma.invSupplierPayment.findFirst({
      where: {
        paymentNumber: {
          startsWith: `PAY-${year}`,
        },
      },
      orderBy: { paymentNumber: 'desc' },
    });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.paymentNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    const paymentNumber = `PAY-${year}-${sequence.toString().padStart(5, '0')}`;

    // إنشاء الدفعة
    const payment = await this.prisma.invSupplierPayment.create({
      data: {
        paymentNumber,
        paymentDate: new Date(),
        supplierId: invoice.supplierId,
        invoiceId: id,
        amount: paymentData.amount,
        currency: invoice.currency,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
        status: 'completed',
      },
    });

    // تحديث الفاتورة
    const newPaidAmount = Number(invoice.paidAmount) + paymentData.amount;
    const newRemainingAmount = Number(invoice.totalAmount) - newPaidAmount;
    const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

    await this.prisma.invPurchaseInvoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: newStatus,
      },
    });

    return payment;
  }

  async getStats() {
    const [total, draft, posted, partial, paid] = await Promise.all([
      this.prisma.invPurchaseInvoice.count(),
      this.prisma.invPurchaseInvoice.count({ where: { status: 'draft' } }),
      this.prisma.invPurchaseInvoice.count({ where: { status: 'posted' } }),
      this.prisma.invPurchaseInvoice.count({ where: { status: 'partial' } }),
      this.prisma.invPurchaseInvoice.count({ where: { status: 'paid' } }),
    ]);

    const totalAmount = await this.prisma.invPurchaseInvoice.aggregate({
      _sum: { totalAmount: true },
    });

    const paidAmount = await this.prisma.invPurchaseInvoice.aggregate({
      _sum: { paidAmount: true },
    });

    const remainingAmount = await this.prisma.invPurchaseInvoice.aggregate({
      _sum: { remainingAmount: true },
    });

    return {
      total,
      draft,
      posted,
      partial,
      paid,
      totalAmount: totalAmount._sum.totalAmount || 0,
      paidAmount: paidAmount._sum.paidAmount || 0,
      remainingAmount: remainingAmount._sum.remainingAmount || 0,
    };
  }
}
