import { IsString, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum MovementType {
  RECEIPT = 'receipt',
  ISSUE = 'issue',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export enum MovementStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export class MovementItemDto {
  @ApiProperty({ description: 'معرف الصنف' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'الكمية' })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiPropertyOptional({ description: 'تكلفة الوحدة' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitCost?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMovementDto {
  @ApiProperty({ description: 'نوع الحركة', enum: MovementType })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiPropertyOptional({ description: 'معرف المستودع المصدر (للصرف والتحويل)' })
  @IsOptional()
  @IsUUID()
  fromWarehouseId?: string;

  @ApiPropertyOptional({ description: 'معرف المستودع الوجهة (للاستلام والتحويل)' })
  @IsOptional()
  @IsUUID()
  toWarehouseId?: string;

  @ApiPropertyOptional({ description: 'نوع المرجع', example: 'PO' })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'معرف المرجع' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'تاريخ الحركة' })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'بنود الحركة', type: [MovementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  items: MovementItemDto[];

  @ApiProperty({ description: 'معرف المنشئ' })
  @IsString()
  createdBy: string;
}

export class UpdateMovementDto {
  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'بنود الحركة', type: [MovementItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  items?: MovementItemDto[];
}

export class QueryMovementsDto {
  @ApiPropertyOptional({ description: 'عدد السجلات للتخطي' })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ description: 'عدد السجلات للجلب' })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'نوع الحركة', enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @ApiPropertyOptional({ description: 'حالة الحركة', enum: MovementStatus })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({ description: 'معرف المستودع' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'من تاريخ' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
