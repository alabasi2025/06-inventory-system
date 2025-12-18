import { IsString, IsOptional, IsUUID, MaxLength, IsNumber, IsDateString, IsArray, ValidateNested, Min, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum GoodsReceiptStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export class GoodsReceiptItemDto {
  @ApiProperty({ description: 'معرف بند أمر الشراء' })
  @IsUUID()
  orderItemId: string;

  @ApiProperty({ description: 'الكمية المستلمة' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  receivedQty: number;

  @ApiPropertyOptional({ description: 'الكمية المرفوضة' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rejectedQty?: number;

  @ApiPropertyOptional({ description: 'سبب الرفض' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

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

export class CreateGoodsReceiptDto {
  @ApiProperty({ description: 'معرف أمر الشراء' })
  @IsUUID()
  orderId: string;

  @ApiPropertyOptional({ description: 'تاريخ الاستلام' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @ApiPropertyOptional({ description: 'رقم إذن الدخول', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gatePassNo?: string;

  @ApiPropertyOptional({ description: 'رقم فاتورة المورد', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierInvoiceNo?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'عناصر الاستلام', type: [GoodsReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsReceiptItemDto)
  items: GoodsReceiptItemDto[];
}

export class UpdateGoodsReceiptDto {
  @ApiPropertyOptional({ description: 'تاريخ الاستلام' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;

  @ApiPropertyOptional({ description: 'رقم إذن الدخول', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  gatePassNo?: string;

  @ApiPropertyOptional({ description: 'رقم فاتورة المورد', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  supplierInvoiceNo?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GoodsReceiptQueryDto {
  @ApiPropertyOptional({ description: 'معرف أمر الشراء' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ description: 'حالة المحضر', enum: GoodsReceiptStatus })
  @IsOptional()
  @IsEnum(GoodsReceiptStatus)
  status?: GoodsReceiptStatus;

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
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
