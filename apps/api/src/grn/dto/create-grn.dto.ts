import { IsString, IsOptional, IsUUID, IsDateString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrnItemDto {
  @ApiProperty({ description: 'معرف الصنف' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'الكمية المطلوبة' })
  @IsNumber()
  @Min(0)
  orderedQuantity: number;

  @ApiProperty({ description: 'الكمية المستلمة' })
  @IsNumber()
  @Min(0)
  receivedQuantity: number;

  @ApiPropertyOptional({ description: 'الكمية المقبولة' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  acceptedQuantity?: number;

  @ApiPropertyOptional({ description: 'الكمية المرفوضة' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rejectedQuantity?: number;

  @ApiProperty({ description: 'معرف وحدة القياس' })
  @IsUUID()
  unitId: string;

  @ApiPropertyOptional({ description: 'تكلفة الوحدة' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({ description: 'رقم الدفعة' })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'الأرقام التسلسلية' })
  @IsOptional()
  @IsString()
  serialNumbers?: string;

  @ApiPropertyOptional({ description: 'تاريخ الانتهاء' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'حالة الفحص' })
  @IsOptional()
  @IsString()
  inspectionStatus?: string;

  @ApiPropertyOptional({ description: 'سبب الرفض' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateGrnDto {
  @ApiPropertyOptional({ description: 'رقم سند الاستلام (يتم توليده تلقائياً)' })
  @IsOptional()
  @IsString()
  grnNumber?: string;

  @ApiPropertyOptional({ description: 'تاريخ الاستلام' })
  @IsOptional()
  @IsDateString()
  grnDate?: string;

  @ApiPropertyOptional({ description: 'معرف أمر الشراء' })
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @ApiProperty({ description: 'معرف المورد' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'معرف المستودع' })
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'رقم إشعار التسليم' })
  @IsOptional()
  @IsString()
  deliveryNoteNumber?: string;

  @ApiPropertyOptional({ description: 'رقم الفاتورة' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ description: 'رقم المركبة' })
  @IsOptional()
  @IsString()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'اسم السائق' })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'معرف المستلم' })
  @IsOptional()
  @IsString()
  receivedBy?: string;

  @ApiProperty({ description: 'بنود سند الاستلام', type: [CreateGrnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrnItemDto)
  items: CreateGrnItemDto[];
}
