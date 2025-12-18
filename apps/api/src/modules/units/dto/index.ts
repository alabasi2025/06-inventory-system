import { IsString, IsOptional, IsBoolean, MaxLength, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ description: 'كود الوحدة', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ description: 'اسم الوحدة بالعربية', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'اسم الوحدة بالإنجليزية', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiProperty({ description: 'رمز الوحدة', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  symbol: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}

export class UnitQueryDto {
  @ApiPropertyOptional({ description: 'البحث بالاسم أو الكود' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'رقم الصفحة', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'عدد العناصر في الصفحة', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
