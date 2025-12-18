import { IsString, IsOptional, IsUUID, MaxLength, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

export class CreateContractDto {
  @ApiProperty({ description: 'معرف المورد' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'رقم العقد', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  contractNo: string;

  @ApiProperty({ description: 'عنوان العقد', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'تاريخ البداية' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'تاريخ النهاية' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'قيمة العقد' })
  @Type(() => Number)
  @IsNumber()
  value: number;

  @ApiPropertyOptional({ description: 'شروط العقد' })
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ description: 'رابط المرفق', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  attachment?: string;

  @ApiPropertyOptional({ description: 'حالة العقد', enum: ContractStatus, default: ContractStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

export class UpdateContractDto extends PartialType(CreateContractDto) {}
