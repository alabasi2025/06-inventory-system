import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from '../../common/services/sequence.service';
import { CreatePurchaseRequestDto, UpdatePurchaseRequestDto, PurchaseRequestQueryDto, ApproveRejectDto } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
  ) {}

  async create(createDto: CreatePurchaseRequestDto, userId: string) {
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

    // Generate request number
    const requestNo = await this.sequenceService.getNextNumber('PR', 'PR');

    // Calculate total estimated
    let totalEstimated = 0;
    const itemsData = createDto.items.map((item) => {
      const lineTotal = item.quantity * (item.estimatedPrice || 0);
      totalEstimated += lineTotal;
      return {
        item_id: item.itemId,
        quantity: item.quantity,
        estimated_price: item.estimatedPrice || 0,
        notes: item.notes,
      };
    });

    return this.prisma.inv_purchase_requests.create({
      data: {
        request_no: requestNo,
        warehouse_id: createDto.warehouseId,
        department_id: createDto.departmentId,
        priority: createDto.priority || 'medium',
        required_date: createDto.requiredDate ? new Date(createDto.requiredDate) : null,
        reason: createDto.reason,
        total_estimated: totalEstimated,
        status: 'draft',
        notes: createDto.notes,
        created_by: userId,
        items: {
          create: itemsData,
        },
      },
      include: {
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
    });
  }

  async findAll(query: PurchaseRequestQueryDto) {
    const { warehouseId, status, priority, fromDate, toDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_purchase_requestsWhereInput = {};

    if (warehouseId) {
      where.warehouse_id = warehouseId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
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
      this.prisma.inv_purchase_requests.findMany({
        where,
        skip,
        take: limit,
        include: {
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
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_purchase_requests.count({ where }),
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
    const request = await this.prisma.inv_purchase_requests.findUnique({
      where: { id },
      include: {
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
        quotations: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('طلب الشراء غير موجود');
    }

    return request;
  }

  async update(id: string, updateDto: UpdatePurchaseRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== 'draft') {
      throw new ConflictException('لا يمكن تعديل طلب غير مسودة');
    }

    // If items are being updated
    if (updateDto.items) {
      await this.prisma.inv_purchase_request_items.deleteMany({
        where: { request_id: id },
      });

      let totalEstimated = 0;
      const itemsData = updateDto.items.map((item) => {
        const lineTotal = item.quantity * (item.estimatedPrice || 0);
        totalEstimated += lineTotal;
        return {
          item_id: item.itemId,
          quantity: item.quantity,
          estimated_price: item.estimatedPrice || 0,
          notes: item.notes,
        };
      });

      return this.prisma.inv_purchase_requests.update({
        where: { id },
        data: {
          warehouse_id: updateDto.warehouseId,
          department_id: updateDto.departmentId,
          priority: updateDto.priority,
          required_date: updateDto.requiredDate ? new Date(updateDto.requiredDate) : undefined,
          reason: updateDto.reason,
          total_estimated: totalEstimated,
          notes: updateDto.notes,
          items: {
            create: itemsData,
          },
        },
        include: {
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

    return this.prisma.inv_purchase_requests.update({
      where: { id },
      data: {
        warehouse_id: updateDto.warehouseId,
        department_id: updateDto.departmentId,
        priority: updateDto.priority,
        required_date: updateDto.requiredDate ? new Date(updateDto.requiredDate) : undefined,
        reason: updateDto.reason,
        notes: updateDto.notes,
      },
      include: {
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

  async submit(id: string, userId: string) {
    const request = await this.findOne(id);

    if (request.status !== 'draft') {
      throw new ConflictException('الطلب ليس في حالة مسودة');
    }

    if (request.items.length === 0) {
      throw new BadRequestException('لا يمكن تقديم طلب فارغ');
    }

    return this.prisma.inv_purchase_requests.update({
      where: { id },
      data: {
        status: 'submitted',
        submitted_by: userId,
        submitted_at: new Date(),
      },
      include: {
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

  async approve(id: string, userId: string, dto: ApproveRejectDto) {
    const request = await this.findOne(id);

    if (request.status !== 'submitted') {
      throw new ConflictException('الطلب ليس في حالة انتظار الموافقة');
    }

    return this.prisma.inv_purchase_requests.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: userId,
        approved_at: new Date(),
        approval_notes: dto.notes,
      },
      include: {
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

  async reject(id: string, userId: string, dto: ApproveRejectDto) {
    const request = await this.findOne(id);

    if (request.status !== 'submitted') {
      throw new ConflictException('الطلب ليس في حالة انتظار الموافقة');
    }

    return this.prisma.inv_purchase_requests.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by: userId,
        rejected_at: new Date(),
        rejection_reason: dto.reason,
      },
      include: {
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

  async cancel(id: string, userId: string) {
    const request = await this.findOne(id);

    if (request.status === 'converted') {
      throw new ConflictException('لا يمكن إلغاء طلب محول');
    }

    return this.prisma.inv_purchase_requests.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelled_by: userId,
        cancelled_at: new Date(),
      },
      include: {
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
}
