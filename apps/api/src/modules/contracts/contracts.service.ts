import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto, userId?: string) {
    // Verify supplier exists
    const supplier = await this.prisma.inv_suppliers.findUnique({
      where: { id: createContractDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('المورد غير موجود');
    }

    // Check if contract number already exists
    const existing = await this.prisma.inv_supplier_contracts.findUnique({
      where: { contract_no: createContractDto.contractNo },
    });
    if (existing) {
      throw new ConflictException(`العقد برقم ${createContractDto.contractNo} موجود مسبقاً`);
    }

    return this.prisma.inv_supplier_contracts.create({
      data: {
        supplier_id: createContractDto.supplierId,
        contract_no: createContractDto.contractNo,
        title: createContractDto.title,
        start_date: new Date(createContractDto.startDate),
        end_date: new Date(createContractDto.endDate),
        value: createContractDto.value,
        terms: createContractDto.terms,
        attachment: createContractDto.attachment,
        status: createContractDto.status || 'active',
        created_by: userId,
      },
      include: {
        supplier: true,
      },
    });
  }

  async findAll(supplierId?: string) {
    const where = supplierId ? { supplier_id: supplierId } : {};

    return this.prisma.inv_supplier_contracts.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.inv_supplier_contracts.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!contract) {
      throw new NotFoundException('العقد غير موجود');
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    await this.findOne(id);

    if (updateContractDto.contractNo) {
      const existing = await this.prisma.inv_supplier_contracts.findFirst({
        where: {
          contract_no: updateContractDto.contractNo,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`العقد برقم ${updateContractDto.contractNo} موجود مسبقاً`);
      }
    }

    return this.prisma.inv_supplier_contracts.update({
      where: { id },
      data: {
        contract_no: updateContractDto.contractNo,
        title: updateContractDto.title,
        start_date: updateContractDto.startDate ? new Date(updateContractDto.startDate) : undefined,
        end_date: updateContractDto.endDate ? new Date(updateContractDto.endDate) : undefined,
        value: updateContractDto.value,
        terms: updateContractDto.terms,
        attachment: updateContractDto.attachment,
        status: updateContractDto.status,
      },
      include: {
        supplier: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inv_supplier_contracts.delete({
      where: { id },
    });
  }

  async getExpiringSoon(days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.inv_supplier_contracts.findMany({
      where: {
        status: 'active',
        end_date: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        supplier: true,
      },
      orderBy: { end_date: 'asc' },
    });
  }
}
