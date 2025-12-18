import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseInvoiceDto } from './create-purchase-invoice.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdatePurchaseInvoiceDto extends PartialType(CreatePurchaseInvoiceDto) {
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'posted', 'partial', 'paid', 'cancelled'])
  status?: string;
}
