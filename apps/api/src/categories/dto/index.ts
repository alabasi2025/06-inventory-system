import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'كود التصنيف', example: 'CAT001' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'اسم التصنيف بالعربي', example: 'قطع غيار كهربائية' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم التصنيف بالإنجليزي', example: 'Electrical Parts' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'معرف التصنيف الأب' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'وصف التصنيف' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class QueryCategoriesDto {
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

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  isActive?: boolean;
}
