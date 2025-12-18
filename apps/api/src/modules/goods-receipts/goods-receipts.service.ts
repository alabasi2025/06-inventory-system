import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from '../../common/services/sequence.service';
import { StockService } from '../../common/services/stock.service';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, GoodsReceiptQueryDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class GoodsReceiptsService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
    private stockService: StockService,
  ) {}

  async create(createDto: CreateGoodsReceiptDto, userId: string) {
    // Validate purchase order
    const order = await this.prisma.inv_purchase_orders.findUnique({
      where: { id: createDto.orderId },
      include: {
        items: true,
        warehouse: true,
      },
    });

    if (!order) {
      throw new NotFoundException('أمر الشراء غير موجود');
    }

    if (order.status !== 'sent' && order.status !== 'partial') {
      throw new BadRequestException('يجب أن يكون أمر الشراء مرسلاً أو مستلماً جزئياً');
    }

    // Validate items
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('يجب إضافة عنصر واحد على الأقل');
    }

    // Validate each item
    for (const item of createDto.items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) {
        throw new NotFoundException(`بند أمر الشراء ${item.orderItemId} غير موجود`);
      }

      const remainingQty = Number(orderItem.quantity) - Number(orderItem.received_qty);
      if (item.receivedQty > remainingQty) {
        throw new BadRequestException(
          `الكمية المستلمة (${item.receivedQty}) أكبر من الكمية المتبقية (${remainingQty})`,
        );
      }
    }

    // Generate receipt number
    const receiptNo = await this.sequenceService.getNextNumber('GR', 'GR');

    // Create receipt with items
    return this.prisma.inv_goods_receipts.create({
      data: {
        receipt_no: receiptNo,
        order_id: createDto.orderId,
        receipt_date: createDto.receiptDate ? new Date(createDto.receiptDate) : new Date(),
        gate_pass_no: createDto.gatePassNo,
        supplier_invoice_no: createDto.supplierInvoiceNo,
        status: 'draft',
        notes: createDto.notes,
        created_by: userId,
        items: {
          create: createDto.items.map((item) => ({
            order_item_id: item.orderItemId,
            received_qty: item.receivedQty,
            rejected_qty: item.rejectedQty || 0,
            rejection_reason: item.rejectionReason,
            batch_no: item.batchNo,
            serial_no: item.serialNo,
            expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
            notes: item.notes,
          })),
        },
      },
      include: {
        order: {
          include: {
            supplier: true,
            warehouse: true,
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                item: {
                  include: {
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(query: GoodsReceiptQueryDto) {
    const { orderId, status, fromDate, toDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_goods_receiptsWhereInput = {};

    if (orderId) {
      where.order_id = orderId;
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.receipt_date = {};
      if (fromDate) {
        where.receipt_date.gte = new Date(fromDate);
      }
      if (toDate) {
        where.receipt_date.lte = new Date(toDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_goods_receipts.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              supplier: true,
              warehouse: true,
            },
          },
          items: {
            include: {
              order_item: {
                include: {
                  item: {
                    include: {
                      unit: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_goods_receipts.count({ where }),
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
    const receipt = await this.prisma.inv_goods_receipts.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            supplier: true,
            warehouse: true,
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
        },
        items: {
          include: {
            order_item: {
              include: {
                item: {
                  include: {
                    unit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('محضر الاستلام غير موجود');
    }

    return receipt;
  }

  async update(id: string, updateDto: UpdateGoodsReceiptDto) {
    const receipt = await this.findOne(id);

    if (receipt.status !== 'draft') {
      throw new ConflictException('لا يمكن تعديل محضر مؤكد أو ملغى');
    }

    return this.prisma.inv_goods_receipts.update({
      where: { id },
      data: {
        receipt_date: updateDto.receiptDate ? new Date(updateDto.receiptDate) : undefined,
        gate_pass_no: updateDto.gatePassNo,
        supplier_invoice_no: updateDto.supplierInvoiceNo,
        notes: updateDto.notes,
      },
      include: {
        order: {
          include: {
            supplier: true,
            warehouse: true,
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  async confirm(id: string, userId: string) {
    const receipt = await this.findOne(id);

    if (receipt.status !== 'draft') {
      throw new ConflictException('المحضر مؤكد مسبقاً أو ملغى');
    }

    // Process each item - update stock and PO received quantities
    for (const receiptItem of receipt.items) {
      const orderItem = receiptItem.order_item;
      const receivedQty = Number(receiptItem.received_qty);
      const unitPrice = Number(orderItem.unit_price);

      // Update stock
      await this.stockService.updateStock(
        receipt.order.warehouse_id,
        orderItem.item_id,
        receivedQty,
        'add',
        unitPrice,
      );

      // Update PO item received quantity
      await this.prisma.inv_purchase_order_items.update({
        where: { id: orderItem.id },
        data: {
          received_qty: { increment: receivedQty },
        },
      });
    }

    // Create inventory movement
    const movementNo = await this.sequenceService.getNextNumber('MOV', 'MOV');
    
    await this.prisma.inv_movements.create({
      data: {
        movement_no: movementNo,
        type: 'receipt',
        warehouse_id: receipt.order.warehouse_id,
        reference_type: 'goods_receipt',
        reference_id: id,
        movement_date: receipt.receipt_date,
        status: 'confirmed',
        created_by: userId,
        confirmed_by: userId,
        confirmed_at: new Date(),
        items: {
          create: receipt.items.map((item) => ({
            item_id: item.order_item.item_id,
            quantity: item.received_qty,
            unit_cost: item.order_item.unit_price,
            total_cost: Number(item.received_qty) * Number(item.order_item.unit_price),
            batch_no: item.batch_no,
            serial_no: item.serial_no,
            expiry_date: item.expiry_date,
          })),
        },
      },
    });

    // Update PO status
    await this.updatePOStatus(receipt.order_id);

    // Update receipt status
    return this.prisma.inv_goods_receipts.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmed_by: userId,
        confirmed_at: new Date(),
      },
      include: {
        order: {
          include: {
            supplier: true,
            warehouse: true,
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const receipt = await this.findOne(id);

    if (receipt.status === 'cancelled') {
      throw new ConflictException('المحضر ملغى مسبقاً');
    }

    // If confirmed, reverse the stock changes
    if (receipt.status === 'confirmed') {
      for (const receiptItem of receipt.items) {
        const orderItem = receiptItem.order_item;
        const receivedQty = Number(receiptItem.received_qty);

        // Reverse stock
        await this.stockService.updateStock(
          receipt.order.warehouse_id,
          orderItem.item_id,
          receivedQty,
          'subtract',
        );

        // Reverse PO item received quantity
        await this.prisma.inv_purchase_order_items.update({
          where: { id: orderItem.id },
          data: {
            received_qty: { decrement: receivedQty },
          },
        });
      }

      // Update PO status
      await this.updatePOStatus(receipt.order_id);
    }

    return this.prisma.inv_goods_receipts.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelled_by: userId,
        cancelled_at: new Date(),
      },
      include: {
        order: {
          include: {
            supplier: true,
            warehouse: true,
          },
        },
        items: {
          include: {
            order_item: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });
  }

  private async updatePOStatus(orderId: string) {
    const order = await this.prisma.inv_purchase_orders.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return;

    let allReceived = true;
    let anyReceived = false;

    for (const item of order.items) {
      const received = Number(item.received_qty);
      const ordered = Number(item.quantity);

      if (received < ordered) {
        allReceived = false;
      }
      if (received > 0) {
        anyReceived = true;
      }
    }

    let newStatus = order.status;
    if (allReceived) {
      newStatus = 'received';
    } else if (anyReceived) {
      newStatus = 'partial';
    }

    if (newStatus !== order.status) {
      await this.prisma.inv_purchase_orders.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    }
  }
}
