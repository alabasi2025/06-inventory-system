import { IsString, IsOptional, IsUUID, MaxLength, IsNumber, IsEnum, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
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
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'تكلفة الوحدة' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiPropertyOptional({ description: 'رقم الدفعة', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNo?: string;

  @ApiPropertyOptional({ description: 'الرقم التسلسلي', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  serialNo?: string;

  @ApiPropertyOptional({ description: 'تاريخ الانتهاء' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMovementDto {
  @ApiProperty({ description: 'نوع الحركة', enum: MovementType })
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({ description: 'معرف المستودع' })
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'معرف المستودع المستلم (للتحويلات)' })
  @IsOptional()
  @IsUUID()
  toWarehouseId?: string;

  @ApiPropertyOptional({ description: 'نوع المرجع', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({ description: 'معرف المرجع' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'تاريخ الحركة' })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'عناصر الحركة', type: [MovementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  items: MovementItemDto[];
}

export class UpdateMovementDto {
  @ApiPropertyOptional({ description: 'تاريخ الحركة' })
  @IsOptional()
  @IsDateString()
  movementDate?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'عناصر الحركة', type: [MovementItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementItemDto)
  items?: MovementItemDto[];
}

export class MovementQueryDto {
  @ApiPropertyOptional({ description: 'نوع الحركة', enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @ApiPropertyOptional({ description: 'معرف المستودع' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'حالة الحركة', enum: MovementStatus })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({ description: 'من تاريخ' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
