import { IsString, IsOptional, IsUUID, MaxLength, IsNumber, IsEnum, IsDateString, IsArray, ValidateNested, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PurchaseRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum PurchaseRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class PurchaseRequestItemDto {
  @ApiProperty({ description: 'معرف الصنف' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'الكمية المطلوبة' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: 'السعر التقديري' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseRequestDto {
  @ApiProperty({ description: 'معرف المستودع الطالب' })
  @IsUUID()
  warehouseId: string;

  @ApiPropertyOptional({ description: 'معرف القسم الطالب' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'الأولوية', enum: PurchaseRequestPriority, default: PurchaseRequestPriority.MEDIUM })
  @IsOptional()
  @IsEnum(PurchaseRequestPriority)
  priority?: PurchaseRequestPriority;

  @ApiPropertyOptional({ description: 'تاريخ الحاجة' })
  @IsOptional()
  @IsDateString()
  requiredDate?: string;

  @ApiPropertyOptional({ description: 'سبب الطلب' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'عناصر الطلب', type: [PurchaseRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestItemDto)
  items: PurchaseRequestItemDto[];
}

export class UpdatePurchaseRequestDto extends PartialType(CreatePurchaseRequestDto) {}

export class PurchaseRequestQueryDto {
  @ApiPropertyOptional({ description: 'حالة الطلب', enum: PurchaseRequestStatus })
  @IsOptional()
  @IsEnum(PurchaseRequestStatus)
  status?: PurchaseRequestStatus;

  @ApiPropertyOptional({ description: 'الأولوية', enum: PurchaseRequestPriority })
  @IsOptional()
  @IsEnum(PurchaseRequestPriority)
  priority?: PurchaseRequestPriority;

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

export class ApproveRejectDto {
  @ApiPropertyOptional({ description: 'ملاحظات الموافقة' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'سبب الرفض' })
  @IsOptional()
  @IsString()
  reason?: string;
}
