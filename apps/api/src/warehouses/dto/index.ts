import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum WarehouseType {
  MAIN = 'main',
  SUB = 'sub',
  TRANSIT = 'transit',
}

export class CreateWarehouseDto {
  @ApiProperty({ description: 'كود المستودع', example: 'WH001' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'اسم المستودع بالعربي', example: 'المستودع الرئيسي' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم المستودع بالإنجليزي', example: 'Main Warehouse' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'نوع المستودع', enum: WarehouseType, default: WarehouseType.MAIN })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({ description: 'معرف المحطة' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'معرف المدير' })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {}

export class QueryWarehousesDto {
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

  @ApiPropertyOptional({ description: 'نوع المستودع', enum: WarehouseType })
  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  isActive?: boolean;
}
