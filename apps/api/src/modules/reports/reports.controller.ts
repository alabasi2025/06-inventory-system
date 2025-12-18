import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('التقارير - Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'لوحة التحكم الرئيسية' })
  @ApiResponse({ status: 200, description: 'بيانات لوحة التحكم' })
  getDashboard() {
    return this.reportsService.getDashboard();
  }

  @Get('stock')
  @ApiOperation({ summary: 'تقرير المخزون' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تقرير المخزون' })
  getStockReport(@Query('warehouseId') warehouseId?: string) {
    return this.reportsService.getStockReport(warehouseId);
  }

  @Get('stock/low')
  @ApiOperation({ summary: 'تقرير الأصناف تحت الحد الأدنى' })
  @ApiResponse({ status: 200, description: 'تقرير الأصناف تحت الحد الأدنى' })
  getLowStockReport() {
    return this.reportsService.getLowStockReport();
  }

  @Get('stock/movements')
  @ApiOperation({ summary: 'تقرير حركات المخزون' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, description: 'إلى تاريخ' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تقرير حركات المخزون' })
  getStockMovementReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.reportsService.getStockMovementReport(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
      warehouseId,
    );
  }

  @Get('stock/expiry')
  @ApiOperation({ summary: 'تقرير الأصناف المنتهية الصلاحية' })
  @ApiQuery({ name: 'days', required: false, description: 'عدد الأيام (افتراضي 90)' })
  @ApiResponse({ status: 200, description: 'تقرير الأصناف المنتهية الصلاحية' })
  getExpiryReport(@Query('days') days?: number) {
    return this.reportsService.getExpiryReport(days);
  }

  @Get('purchases')
  @ApiOperation({ summary: 'تقرير المشتريات' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, description: 'إلى تاريخ' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تقرير المشتريات' })
  getPurchaseReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.reportsService.getPurchaseReport(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
      supplierId,
    );
  }

  @Get('suppliers/performance')
  @ApiOperation({ summary: 'تقرير أداء الموردين' })
  @ApiResponse({ status: 200, description: 'تقرير أداء الموردين' })
  getSupplierPerformanceReport() {
    return this.reportsService.getSupplierPerformanceReport();
  }

  @Get('items/:id/history')
  @ApiOperation({ summary: 'تاريخ حركات صنف محدد' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, description: 'إلى تاريخ' })
  @ApiResponse({ status: 200, description: 'تاريخ حركات الصنف' })
  getItemMovementHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.reportsService.getItemMovementHistory(
      id,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
    );
  }
}
