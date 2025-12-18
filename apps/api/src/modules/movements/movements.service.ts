import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SequenceService } from '../../common/services/sequence.service';
import { StockService } from '../../common/services/stock.service';
import { CreateMovementDto, UpdateMovementDto, MovementQueryDto, MovementType } from './dto';
import { Prisma } from '../../../../../generated/prisma';

@Injectable()
export class MovementsService {
  constructor(
    private prisma: PrismaService,
    private sequenceService: SequenceService,
    private stockService: StockService,
  ) {}

  async create(createMovementDto: CreateMovementDto, userId: string) {
    // Validate warehouse
    const warehouse = await this.prisma.inv_warehouses.findUnique({
      where: { id: createMovementDto.warehouseId },
    });
    if (!warehouse) {
      throw new NotFoundException('المستودع غير موجود');
    }

    // Validate to_warehouse for transfers
    if (createMovementDto.type === MovementType.TRANSFER) {
      if (!createMovementDto.toWarehouseId) {
        throw new BadRequestException('يجب تحديد المستودع المستلم للتحويلات');
      }
      const toWarehouse = await this.prisma.inv_warehouses.findUnique({
        where: { id: createMovementDto.toWarehouseId },
      });
      if (!toWarehouse) {
        throw new NotFoundException('المستودع المستلم غير موجود');
      }
      if (createMovementDto.warehouseId === createMovementDto.toWarehouseId) {
        throw new BadRequestException('لا يمكن التحويل لنفس المستودع');
      }
    }

    // Validate items
    if (!createMovementDto.items || createMovementDto.items.length === 0) {
      throw new BadRequestException('يجب إضافة عنصر واحد على الأقل');
    }

    // Validate all items exist
    for (const item of createMovementDto.items) {
      const itemExists = await this.prisma.inv_items.findUnique({
        where: { id: item.itemId },
      });
      if (!itemExists) {
        throw new NotFoundException(`الصنف ${item.itemId} غير موجود`);
      }
    }

    // Generate movement number
    const movementNo = await this.sequenceService.getNextNumber('MOV', 'MOV');

    // Calculate total cost
    const totalCost = createMovementDto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );

    // Create movement with items
    return this.prisma.inv_movements.create({
      data: {
        movement_no: movementNo,
        type: createMovementDto.type,
        warehouse_id: createMovementDto.warehouseId,
        to_warehouse_id: createMovementDto.toWarehouseId,
        reference_type: createMovementDto.referenceType,
        reference_id: createMovementDto.referenceId,
        movement_date: createMovementDto.movementDate
          ? new Date(createMovementDto.movementDate)
          : new Date(),
        total_cost: totalCost,
        status: 'draft',
        notes: createMovementDto.notes,
        created_by: userId,
        items: {
          create: createMovementDto.items.map((item) => ({
            item_id: item.itemId,
            quantity: item.quantity,
            unit_cost: item.unitCost,
            total_cost: item.quantity * item.unitCost,
            batch_no: item.batchNo,
            serial_no: item.serialNo,
            expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
            notes: item.notes,
          })),
        },
      },
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async findAll(query: MovementQueryDto) {
    const { type, warehouseId, status, fromDate, toDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.inv_movementsWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (warehouseId) {
      where.OR = [
        { warehouse_id: warehouseId },
        { to_warehouse_id: warehouseId },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (fromDate || toDate) {
      where.movement_date = {};
      if (fromDate) {
        where.movement_date.gte = new Date(fromDate);
      }
      if (toDate) {
        where.movement_date.lte = new Date(toDate);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.inv_movements.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          to_warehouse: true,
          items: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.inv_movements.count({ where }),
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
    const movement = await this.prisma.inv_movements.findUnique({
      where: { id },
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: {
              include: {
                category: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!movement) {
      throw new NotFoundException('الحركة غير موجودة');
    }

    return movement;
  }

  async update(id: string, updateMovementDto: UpdateMovementDto) {
    const movement = await this.findOne(id);

    if (movement.status !== 'draft') {
      throw new ConflictException('لا يمكن تعديل حركة مؤكدة أو ملغاة');
    }

    // If items are being updated, delete old and create new
    if (updateMovementDto.items) {
      await this.prisma.inv_movement_items.deleteMany({
        where: { movement_id: id },
      });

      const totalCost = updateMovementDto.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0,
      );

      return this.prisma.inv_movements.update({
        where: { id },
        data: {
          movement_date: updateMovementDto.movementDate
            ? new Date(updateMovementDto.movementDate)
            : undefined,
          notes: updateMovementDto.notes,
          total_cost: totalCost,
          items: {
            create: updateMovementDto.items.map((item) => ({
              item_id: item.itemId,
              quantity: item.quantity,
              unit_cost: item.unitCost,
              total_cost: item.quantity * item.unitCost,
              batch_no: item.batchNo,
              serial_no: item.serialNo,
              expiry_date: item.expiryDate ? new Date(item.expiryDate) : null,
              notes: item.notes,
            })),
          },
        },
        include: {
          warehouse: true,
          to_warehouse: true,
          items: {
            include: {
              item: true,
            },
          },
        },
      });
    }

    return this.prisma.inv_movements.update({
      where: { id },
      data: {
        movement_date: updateMovementDto.movementDate
          ? new Date(updateMovementDto.movementDate)
          : undefined,
        notes: updateMovementDto.notes,
      },
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async confirm(id: string, userId: string) {
    const movement = await this.findOne(id);

    if (movement.status !== 'draft') {
      throw new ConflictException('الحركة مؤكدة مسبقاً أو ملغاة');
    }

    // Process based on movement type
    switch (movement.type) {
      case 'receipt':
        await this.processReceipt(movement);
        break;
      case 'issue':
        await this.processIssue(movement);
        break;
      case 'transfer':
        await this.processTransfer(movement);
        break;
      case 'adjustment':
        await this.processAdjustment(movement);
        break;
    }

    // Update movement status
    return this.prisma.inv_movements.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmed_by: userId,
        confirmed_at: new Date(),
      },
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const movement = await this.findOne(id);

    if (movement.status === 'cancelled') {
      throw new ConflictException('الحركة ملغاة مسبقاً');
    }

    // If confirmed, reverse the stock changes
    if (movement.status === 'confirmed') {
      await this.reverseMovement(movement);
    }

    return this.prisma.inv_movements.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelled_by: userId,
        cancelled_at: new Date(),
      },
      include: {
        warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  private async processReceipt(movement: any) {
    for (const item of movement.items) {
      await this.stockService.updateStock(
        movement.warehouse_id,
        item.item_id,
        Number(item.quantity),
        'add',
        Number(item.unit_cost),
      );
    }

    // TODO: Create accounting journal entry
    // await this.createJournalEntry({
    //   debit: { account: 'المخزون', amount: movement.total_cost },
    //   credit: { account: 'الموردين', amount: movement.total_cost },
    // });
  }

  private async processIssue(movement: any) {
    for (const item of movement.items) {
      await this.stockService.updateStock(
        movement.warehouse_id,
        item.item_id,
        Number(item.quantity),
        'subtract',
      );
    }

    // TODO: Create accounting journal entry based on issue type
  }

  private async processTransfer(movement: any) {
    for (const item of movement.items) {
      // Subtract from source warehouse
      await this.stockService.updateStock(
        movement.warehouse_id,
        item.item_id,
        Number(item.quantity),
        'subtract',
      );

      // Add to destination warehouse
      await this.stockService.updateStock(
        movement.to_warehouse_id,
        item.item_id,
        Number(item.quantity),
        'add',
        Number(item.unit_cost),
      );
    }
  }

  private async processAdjustment(movement: any) {
    for (const item of movement.items) {
      const currentStock = await this.stockService.getAvailableStock(
        movement.warehouse_id,
        item.item_id,
      );

      const adjustmentQty = Number(item.quantity);
      const difference = adjustmentQty - currentStock;

      if (difference > 0) {
        // Positive adjustment (add stock)
        await this.stockService.updateStock(
          movement.warehouse_id,
          item.item_id,
          difference,
          'add',
          Number(item.unit_cost),
        );
      } else if (difference < 0) {
        // Negative adjustment (subtract stock)
        await this.stockService.updateStock(
          movement.warehouse_id,
          item.item_id,
          Math.abs(difference),
          'subtract',
        );
      }
    }

    // TODO: Create accounting journal entry for adjustment
  }

  private async reverseMovement(movement: any) {
    switch (movement.type) {
      case 'receipt':
        for (const item of movement.items) {
          await this.stockService.updateStock(
            movement.warehouse_id,
            item.item_id,
            Number(item.quantity),
            'subtract',
          );
        }
        break;
      case 'issue':
        for (const item of movement.items) {
          await this.stockService.updateStock(
            movement.warehouse_id,
            item.item_id,
            Number(item.quantity),
            'add',
            Number(item.unit_cost),
          );
        }
        break;
      case 'transfer':
        for (const item of movement.items) {
          // Reverse: add back to source
          await this.stockService.updateStock(
            movement.warehouse_id,
            item.item_id,
            Number(item.quantity),
            'add',
            Number(item.unit_cost),
          );
          // Reverse: subtract from destination
          await this.stockService.updateStock(
            movement.to_warehouse_id,
            item.item_id,
            Number(item.quantity),
            'subtract',
          );
        }
        break;
    }
  }
}
