import { IsString, IsOptional, IsBoolean, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @ApiProperty({ description: 'كود الصنف', example: 'ITM001' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'الباركود' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ description: 'اسم الصنف بالعربي', example: 'كابل كهربائي 10 مم' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم الصنف بالإنجليزي', example: 'Electric Cable 10mm' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ description: 'معرف التصنيف' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'معرف وحدة القياس' })
  @IsUUID()
  unitId: string;

  @ApiPropertyOptional({ description: 'وصف الصنف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'الحد الأدنى للمخزون', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minStock?: number;

  @ApiPropertyOptional({ description: 'الحد الأقصى للمخزون' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxStock?: number;

  @ApiPropertyOptional({ description: 'نقطة إعادة الطلب' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderPoint?: number;

  @ApiPropertyOptional({ description: 'كمية إعادة الطلب' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  reorderQty?: number;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export class QueryItemsDto {
  @ApiPropertyOptional({ description: 'عدد السجلات للتخطي' })
  @IsOptional()
  skip?: number;

  @ApiPropertyOptional({ description: 'عدد السجلات للجلب' })
  @IsOptional()
  take?: number;

  @ApiPropertyOptional({ description: 'نص البحث' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  isActive?: boolean;
}
