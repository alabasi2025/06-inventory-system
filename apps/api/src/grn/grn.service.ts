import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGrnDto, UpdateGrnDto } from './dto';

@Injectable()
export class GrnService {
  constructor(private prisma: PrismaService) {}

  // توليد رقم سند الاستلام
  private async generateGrnNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    const lastGrn = await this.prisma.invGoodsReceivedNote.findFirst({
      where: {
        grnNumber: {
          startsWith: `GRN-${year}${month}`,
        },
      },
      orderBy: { grnNumber: 'desc' },
    });

    let sequence = 1;
    if (lastGrn) {
      const lastSequence = parseInt(lastGrn.grnNumber.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `GRN-${year}${month}-${String(sequence).padStart(4, '0')}`;
  }

  // إنشاء سند استلام جديد
  async create(createGrnDto: CreateGrnDto) {
    const grnNumber = createGrnDto.grnNumber || await this.generateGrnNumber();

    // التحقق من وجود المورد
    const supplier = await this.prisma.invSupplier.findUnique({
      where: { id: createGrnDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    // التحقق من وجود المستودع
    const warehouse = await this.prisma.invWarehouse.findUnique({
      where: { id: createGrnDto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }

    // إنشاء سند الاستلام مع البنود
    const grn = await this.prisma.invGoodsReceivedNote.create({
      data: {
        grnNumber,
        grnDate: createGrnDto.grnDate ? new Date(createGrnDto.grnDate) : new Date(),
        purchaseOrderId: createGrnDto.purchaseOrderId,
        supplierId: createGrnDto.supplierId,
        warehouseId: createGrnDto.warehouseId,
        deliveryNoteNumber: createGrnDto.deliveryNoteNumber,
        invoiceNumber: createGrnDto.invoiceNumber,
        vehicleNumber: createGrnDto.vehicleNumber,
        driverName: createGrnDto.driverName,
        notes: createGrnDto.notes,
        receivedBy: createGrnDto.receivedBy,
        status: 'draft',
        items: {
          create: createGrnDto.items.map(item => ({
            itemId: item.itemId,
            orderedQuantity: item.orderedQuantity,
            receivedQuantity: item.receivedQuantity,
            acceptedQuantity: item.acceptedQuantity || item.receivedQuantity,
            rejectedQuantity: item.rejectedQuantity || 0,
            unitId: item.unitId,
            unitCost: item.unitCost || 0,
            batchNumber: item.batchNumber,
            serialNumbers: item.serialNumbers,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
            inspectionStatus: item.inspectionStatus || 'pending',
            rejectionReason: item.rejectionReason,
            notes: item.notes,
          })),
        },
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return grn;
  }

  // جلب جميع سندات الاستلام
  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: string;
    supplierId?: string;
    warehouseId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.supplierId) {
      where.supplierId = params.supplierId;
    }
    if (params?.warehouseId) {
      where.warehouseId = params.warehouseId;
    }
    if (params?.fromDate || params?.toDate) {
      where.grnDate = {};
      if (params.fromDate) {
        where.grnDate.gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        where.grnDate.lte = new Date(params.toDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.invGoodsReceivedNote.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 50,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: {
            select: { id: true, code: true, name: true },
          },
          warehouse: {
            select: { id: true, code: true, name: true },
          },
          items: {
            include: {
              item: { select: { id: true, code: true, name: true } },
              unit: { select: { id: true, code: true, name: true } },
            },
          },
        },
      }),
      this.prisma.invGoodsReceivedNote.count({ where }),
    ]);

    return { data, total };
  }

  // جلب سند استلام واحد
  async findOne(id: string) {
    const grn = await this.prisma.invGoodsReceivedNote.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    if (!grn) {
      throw new NotFoundException('سند الاستلام غير موجود');
    }

    return grn;
  }

  // تحديث سند استلام
  async update(id: string, updateGrnDto: UpdateGrnDto) {
    const existingGrn = await this.findOne(id);

    if (existingGrn.status !== 'draft') {
      throw new BadRequestException('لا يمكن تعديل سند استلام معتمد');
    }

    // حذف البنود القديمة وإنشاء الجديدة إذا تم تمرير بنود
    if (updateGrnDto.items) {
      await this.prisma.invGrnItem.deleteMany({
        where: { grnId: id },
      });
    }

    const grn = await this.prisma.invGoodsReceivedNote.update({
      where: { id },
      data: {
        grnDate: updateGrnDto.grnDate ? new Date(updateGrnDto.grnDate) : undefined,
        supplierId: updateGrnDto.supplierId,
        warehouseId: updateGrnDto.warehouseId,
        deliveryNoteNumber: updateGrnDto.deliveryNoteNumber,
        invoiceNumber: updateGrnDto.invoiceNumber,
        vehicleNumber: updateGrnDto.vehicleNumber,
        driverName: updateGrnDto.driverName,
        notes: updateGrnDto.notes,
        receivedBy: updateGrnDto.receivedBy,
        ...(updateGrnDto.items && {
          items: {
            create: updateGrnDto.items.map(item => ({
              itemId: item.itemId,
              orderedQuantity: item.orderedQuantity,
              receivedQuantity: item.receivedQuantity,
              acceptedQuantity: item.acceptedQuantity || item.receivedQuantity,
              rejectedQuantity: item.rejectedQuantity || 0,
              unitId: item.unitId,
              unitCost: item.unitCost || 0,
              batchNumber: item.batchNumber,
              serialNumbers: item.serialNumbers,
              expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
              inspectionStatus: item.inspectionStatus || 'pending',
              rejectionReason: item.rejectionReason,
              notes: item.notes,
            })),
          },
        }),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return grn;
  }

  // اعتماد سند الاستلام
  async approve(id: string, inspectedBy: string) {
    const grn = await this.findOne(id);

    if (grn.status !== 'draft') {
      throw new BadRequestException('سند الاستلام معتمد مسبقاً');
    }

    // تحديث أرصدة المخزون
    for (const item of grn.items) {
      const acceptedQty = Number(item.acceptedQuantity);
      if (acceptedQty > 0) {
        // البحث عن رصيد موجود أو إنشاء جديد
        const existingStock = await this.prisma.invStock.findUnique({
          where: {
            warehouseId_itemId: {
              warehouseId: grn.warehouseId,
              itemId: item.itemId,
            },
          },
        });

        if (existingStock) {
          await this.prisma.invStock.update({
            where: { id: existingStock.id },
            data: {
              quantity: { increment: acceptedQty },
              lastUpdated: new Date(),
            },
          });
        } else {
          await this.prisma.invStock.create({
            data: {
              warehouseId: grn.warehouseId,
              itemId: item.itemId,
              quantity: acceptedQty,
              avgCost: item.unitCost,
            },
          });
        }
      }
    }

    // تحديث حالة سند الاستلام
    const updatedGrn = await this.prisma.invGoodsReceivedNote.update({
      where: { id },
      data: {
        status: 'accepted',
        inspectedBy,
        inspectedAt: new Date(),
      },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            item: true,
            unit: true,
          },
        },
      },
    });

    return updatedGrn;
  }

  // حذف سند استلام
  async remove(id: string) {
    const grn = await this.findOne(id);

    if (grn.status !== 'draft') {
      throw new BadRequestException('لا يمكن حذف سند استلام معتمد');
    }

    await this.prisma.invGoodsReceivedNote.delete({
      where: { id },
    });

    return { message: 'تم حذف سند الاستلام بنجاح' };
  }

  // إحصائيات سندات الاستلام
  async getStats() {
    const [total, draft, accepted, rejected] = await Promise.all([
      this.prisma.invGoodsReceivedNote.count(),
      this.prisma.invGoodsReceivedNote.count({ where: { status: 'draft' } }),
      this.prisma.invGoodsReceivedNote.count({ where: { status: 'accepted' } }),
      this.prisma.invGoodsReceivedNote.count({ where: { status: 'rejected' } }),
    ]);

    return { total, draft, accepted, rejected };
  }
}
