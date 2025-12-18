import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementsDto, MovementType } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MovementsService {
  constructor(private prisma: PrismaService) {}

  private async generateMovementNo(): Promise<string> {
    const today = new Date();
    const prefix = `MV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastMovement = await this.prisma.invMovement.findFirst({
      where: { movementNo: { startsWith: prefix } },
      orderBy: { movementNo: 'desc' },
    });

    let sequence = 1;
    if (lastMovement) {
      const lastSeq = parseInt(lastMovement.movementNo.slice(-4));
      sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  async findAll(params: QueryMovementsDto) {
    const { skip = 0, take = 20, type, status, warehouseId, fromDate, toDate } = params;
    
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }
    if (fromDate || toDate) {
      where.movementDate = {};
      if (fromDate) where.movementDate.gte = new Date(fromDate);
      if (toDate) where.movementDate.lte = new Date(toDate);
    }

    const [movements, total] = await Promise.all([
      this.prisma.invMovement.findMany({
        where,
        skip: Number(skip),
        take: Number(take),
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          items: { include: { item: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invMovement.count({ where }),
    ]);

    return { data: movements, total, skip: Number(skip), take: Number(take) };
  }

  async findOne(id: string) {
    const movement = await this.prisma.invMovement.findUnique({
      where: { id },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: {
          include: { item: { include: { unit: true } } },
        },
      },
    });
    if (!movement) {
      throw new NotFoundException('الحركة غير موجودة');
    }
    return movement;
  }

  async create(dto: CreateMovementDto) {
    // التحقق من صحة البيانات حسب نوع الحركة
    this.validateMovementData(dto);

    // التحقق من وجود الأصناف
    for (const item of dto.items) {
      const exists = await this.prisma.invItem.findUnique({ where: { id: item.itemId } });
      if (!exists) {
        throw new NotFoundException(`الصنف ${item.itemId} غير موجود`);
      }
    }

    const movementNo = await this.generateMovementNo();
    const totalAmount = dto.items.reduce((sum, item) => {
      return sum + (item.quantity * (item.unitCost || 0));
    }, 0);

    const movement = await this.prisma.invMovement.create({
      data: {
        movementNo,
        type: dto.type,
        fromWarehouseId: dto.fromWarehouseId,
        toWarehouseId: dto.toWarehouseId,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        movementDate: dto.movementDate ? new Date(dto.movementDate) : new Date(),
        notes: dto.notes,
        totalAmount,
        createdBy: dto.createdBy,
        items: {
          create: dto.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitCost: item.unitCost || 0,
            totalCost: item.quantity * (item.unitCost || 0),
            notes: item.notes,
          })),
        },
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { item: true } },
      },
    });

    return movement;
  }

  private validateMovementData(dto: CreateMovementDto) {
    switch (dto.type) {
      case MovementType.RECEIPT:
        if (!dto.toWarehouseId) {
          throw new BadRequestException('يجب تحديد المستودع الوجهة لحركة الاستلام');
        }
        break;
      case MovementType.ISSUE:
        if (!dto.fromWarehouseId) {
          throw new BadRequestException('يجب تحديد المستودع المصدر لحركة الصرف');
        }
        break;
      case MovementType.TRANSFER:
        if (!dto.fromWarehouseId || !dto.toWarehouseId) {
          throw new BadRequestException('يجب تحديد المستودع المصدر والوجهة لحركة التحويل');
        }
        if (dto.fromWarehouseId === dto.toWarehouseId) {
          throw new BadRequestException('لا يمكن التحويل إلى نفس المستودع');
        }
        break;
      case MovementType.ADJUSTMENT:
        if (!dto.toWarehouseId && !dto.fromWarehouseId) {
          throw new BadRequestException('يجب تحديد المستودع لحركة التسوية');
        }
        break;
    }
  }

  async update(id: string, dto: UpdateMovementDto) {
    const movement = await this.findOne(id);
    
    if (movement.status !== 'draft') {
      throw new ConflictException('لا يمكن تعديل حركة مؤكدة أو ملغاة');
    }

    // تحديث البنود إذا تم تقديمها
    if (dto.items) {
      // حذف البنود القديمة
      await this.prisma.invMovementItem.deleteMany({ where: { movementId: id } });
      
      // إضافة البنود الجديدة
      await this.prisma.invMovementItem.createMany({
        data: dto.items.map(item => ({
          movementId: id,
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost || 0,
          totalCost: item.quantity * (item.unitCost || 0),
          notes: item.notes,
        })),
      });
    }

    return this.prisma.invMovement.update({
      where: { id },
      data: { notes: dto.notes },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { item: true } },
      },
    });
  }

  async confirm(id: string, confirmedBy: string) {
    const movement = await this.findOne(id);
    
    if (movement.status !== 'draft') {
      throw new ConflictException('الحركة مؤكدة مسبقاً أو ملغاة');
    }

    // تحديث الأرصدة
    await this.updateStock(movement);

    return this.prisma.invMovement.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmedBy,
        confirmedAt: new Date(),
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { item: true } },
      },
    });
  }

  private async updateStock(movement: any) {
    for (const item of movement.items) {
      const quantity = new Decimal(item.quantity);
      const unitCost = new Decimal(item.unitCost || 0);

      switch (movement.type) {
        case 'receipt':
          await this.addStock(movement.toWarehouseId, item.itemId, quantity, unitCost);
          break;
        case 'issue':
          await this.reduceStock(movement.fromWarehouseId, item.itemId, quantity);
          break;
        case 'transfer':
          await this.reduceStock(movement.fromWarehouseId, item.itemId, quantity);
          await this.addStock(movement.toWarehouseId, item.itemId, quantity, unitCost);
          break;
        case 'adjustment':
          if (movement.toWarehouseId) {
            await this.addStock(movement.toWarehouseId, item.itemId, quantity, unitCost);
          } else if (movement.fromWarehouseId) {
            await this.reduceStock(movement.fromWarehouseId, item.itemId, quantity);
          }
          break;
      }
    }
  }

  private async addStock(warehouseId: string, itemId: string, quantity: Decimal, unitCost: Decimal) {
    const existing = await this.prisma.invStock.findUnique({
      where: { warehouseId_itemId: { warehouseId, itemId } },
    });

    if (existing) {
      const newQty = new Decimal(existing.quantity).plus(quantity);
      const newAvgCost = newQty.gt(0)
        ? new Decimal(existing.avgCost).times(existing.quantity).plus(unitCost.times(quantity)).div(newQty)
        : new Decimal(0);

      await this.prisma.invStock.update({
        where: { id: existing.id },
        data: {
          quantity: newQty,
          avgCost: newAvgCost,
          lastUpdated: new Date(),
        },
      });
    } else {
      await this.prisma.invStock.create({
        data: {
          warehouseId,
          itemId,
          quantity,
          avgCost: unitCost,
        },
      });
    }

    // تحديث متوسط التكلفة في الصنف
    await this.updateItemAvgCost(itemId);
  }

  private async reduceStock(warehouseId: string, itemId: string, quantity: Decimal) {
    const existing = await this.prisma.invStock.findUnique({
      where: { warehouseId_itemId: { warehouseId, itemId } },
    });

    if (!existing || new Decimal(existing.quantity).lt(quantity)) {
      throw new BadRequestException('الكمية المطلوبة غير متوفرة في المخزون');
    }

    await this.prisma.invStock.update({
      where: { id: existing.id },
      data: {
        quantity: new Decimal(existing.quantity).minus(quantity),
        lastUpdated: new Date(),
      },
    });
  }

  private async updateItemAvgCost(itemId: string) {
    const stocks = await this.prisma.invStock.findMany({
      where: { itemId },
    });

    let totalQty = new Decimal(0);
    let totalValue = new Decimal(0);

    for (const stock of stocks) {
      totalQty = totalQty.plus(stock.quantity);
      totalValue = totalValue.plus(new Decimal(stock.quantity).times(stock.avgCost));
    }

    const avgCost = totalQty.gt(0) ? totalValue.div(totalQty) : new Decimal(0);

    await this.prisma.invItem.update({
      where: { id: itemId },
      data: { avgCost },
    });
  }

  async cancel(id: string) {
    const movement = await this.findOne(id);
    
    if (movement.status === 'cancelled') {
      throw new ConflictException('الحركة ملغاة مسبقاً');
    }

    if (movement.status === 'confirmed') {
      throw new ConflictException('لا يمكن إلغاء حركة مؤكدة');
    }

    return this.prisma.invMovement.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }
}
