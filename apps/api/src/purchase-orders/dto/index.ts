import { IsString, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum POStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIAL = 'partial',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export class POItemDto {
  @ApiProperty({ description: 'معرف الصنف' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'الكمية' })
  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'سعر الوحدة' })
  @Type(() => Number)
  @IsNumber()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'نسبة الضريبة', default: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'نسبة الخصم', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountRate?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'معرف المورد' })
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ description: 'تاريخ التسليم المتوقع' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: 'معرف المستودع' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'شروط الدفع (أيام)', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paymentTerms?: number;

  @ApiPropertyOptional({ description: 'العملة', default: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'بنود أمر الشراء', type: [POItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items: POItemDto[];

  @ApiProperty({ description: 'معرف المنشئ' })
  @IsString()
  createdBy: string;
}

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ description: 'تاريخ التسليم المتوقع' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'بنود أمر الشراء', type: [POItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => POItemDto)
  items?: POItemDto[];
}

export class QueryPurchaseOrdersDto {
  @ApiPropertyOptional({ description: 'عدد السجلات للتخطي' })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ description: 'عدد السجلات للجلب' })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'معرف المورد' })
  @IsOptional()
  @IsUUID()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'حالة الأمر', enum: POStatus })
  @IsOptional()
  @IsEnum(POStatus)
  status?: POStatus;

  @ApiPropertyOptional({ description: 'من تاريخ' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'إلى تاريخ' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
