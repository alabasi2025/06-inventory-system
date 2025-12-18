import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PurchaseInvoicesService } from './purchase-invoices.service';
import { CreatePurchaseInvoiceDto, UpdatePurchaseInvoiceDto } from './dto';

@ApiTags('فواتير المشتريات')
@Controller('api/v1/purchase-invoices')
export class PurchaseInvoicesController {
  constructor(private readonly purchaseInvoicesService: PurchaseInvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'الحصول على جميع فواتير المشتريات' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'supplierId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
  ) {
    return this.purchaseInvoicesService.findAll({ status, supplierId, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'الحصول على إحصائيات فواتير المشتريات' })
  getStats() {
    return this.purchaseInvoicesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على فاتورة محددة' })
  findOne(@Param('id') id: string) {
    return this.purchaseInvoicesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء فاتورة مشتريات جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الفاتورة بنجاح' })
  create(@Body() dto: CreatePurchaseInvoiceDto) {
    return this.purchaseInvoicesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث فاتورة مشتريات' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseInvoiceDto) {
    return this.purchaseInvoicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف فاتورة مشتريات' })
  remove(@Param('id') id: string) {
    return this.purchaseInvoicesService.remove(id);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'ترحيل فاتورة مشتريات' })
  post(@Param('id') id: string) {
    return this.purchaseInvoicesService.post(id);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'إضافة دفعة للفاتورة' })
  addPayment(
    @Param('id') id: string,
    @Body() paymentData: { amount: number; paymentMethod: string; referenceNumber?: string; notes?: string },
  ) {
    return this.purchaseInvoicesService.addPayment(id, paymentData);
  }
}
