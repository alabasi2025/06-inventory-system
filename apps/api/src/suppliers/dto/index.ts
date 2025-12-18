import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SupplierType {
  LOCAL = 'local',
  INTERNATIONAL = 'international',
}

export enum SupplierCategory {
  A = 'A',
  B = 'B',
  C = 'C',
}

export class CreateSupplierDto {
  @ApiProperty({ description: 'كود المورد', example: 'SUP001' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'اسم المورد بالعربي', example: 'شركة الكابلات السعودية' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'اسم المورد بالإنجليزي', example: 'Saudi Cables Company' })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional({ description: 'نوع المورد', enum: SupplierType, default: SupplierType.LOCAL })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiPropertyOptional({ description: 'تصنيف المورد', enum: SupplierCategory, default: SupplierCategory.C })
  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @ApiPropertyOptional({ description: 'الرقم الضريبي' })
  @IsOptional()
  @IsString()
  taxNumber?: string;

  @ApiPropertyOptional({ description: 'رقم السجل التجاري' })
  @IsOptional()
  @IsString()
  crNumber?: string;

  @ApiPropertyOptional({ description: 'رقم الهاتف' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'رقم الجوال' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ description: 'البريد الإلكتروني' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'الموقع الإلكتروني' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'العنوان' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'المدينة' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'الدولة', default: 'SA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'اسم جهة الاتصال' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'هاتف جهة الاتصال' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'شروط الدفع (أيام)', default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paymentTerms?: number;

  @ApiPropertyOptional({ description: 'حد الائتمان', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  creditLimit?: number;

  @ApiPropertyOptional({ description: 'ملاحظات' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'حالة التفعيل', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {}

export class QuerySuppliersDto {
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

  @ApiPropertyOptional({ description: 'نوع المورد', enum: SupplierType })
  @IsOptional()
  @IsEnum(SupplierType)
  type?: SupplierType;

  @ApiPropertyOptional({ description: 'تصنيف المورد', enum: SupplierCategory })
  @IsOptional()
  @IsEnum(SupplierCategory)
  category?: SupplierCategory;

  @ApiPropertyOptional({ description: 'حالة التفعيل' })
  @IsOptional()
  isActive?: boolean;
}
