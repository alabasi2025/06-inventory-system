import { IsString, IsOptional, IsBoolean, IsUUID, MaxLength, IsInt, Min, IsNumber, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty({ description: 'كود الصنف', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'اسم الصنف بالعربية', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'اسم الصنف بالإنجليزية', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nameEn?: string;

  @ApiPropertyOptional({ description: 'وصف الصنف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'معرف التصنيف' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'معرف وحدة القياس' })
  @IsUUID()
  unitId: string;

  @ApiPropertyOptional({ description: 'الباركود', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ description: 'الحد الأدنى للمخزون', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى للمخزون' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiPropertyOptional({ description: 'نقطة إعادة الطلب' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'كمية إعادة الطلب' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reorderQty?: number;

  @ApiPropertyOptional({ description: 'التكلفة المعيارية' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  standardCost?: number;

  @ApiPropertyOptional({ description: 'هل الصنف مسلسل', default: false })
  @IsOptional()
  @IsBoolean()
  isSerialized?: boolean;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class ItemQueryDto {
  @ApiPropertyOptional({ description: 'البحث بالاسم أو الكود أو الباركود' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'معرف وحدة القياس' })
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'أصناف تحت الحد الأدنى فقط' })
  @IsOptional()
  @IsBoolean()
  lowStock?: boolean;

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
