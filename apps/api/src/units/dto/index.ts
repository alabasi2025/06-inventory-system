import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'كود الوحدة', example: 'PCS' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'اسم الوحدة بالعربي', example: 'قطعة' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم الوحدة بالإنجليزي', example: 'Piece' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

export class QueryUnitsDto {
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
