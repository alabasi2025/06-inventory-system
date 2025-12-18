import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard - لوحة التحكم')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'نظرة عامة', description: 'جلب ملخص النظام والإحصائيات' })
  @ApiResponse({ status: 200, description: 'تم جلب البيانات بنجاح' })
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'أصناف منخفضة المخزون', description: 'جلب الأصناف التي وصلت للحد الأدنى' })
  @ApiResponse({ status: 200, description: 'تم جلب البيانات بنجاح' })
  getLowStockItems() {
    return this.dashboardService.getLowStockItems();
  }

  @Get('stock-report')
  @ApiOperation({ summary: 'تقرير المخزون', description: 'تقرير تفصيلي بأرصدة المخزون' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم جلب التقرير بنجاح' })
  getStockReport(@Query('warehouseId') warehouseId?: string) {
    return this.dashboardService.getStockReport(warehouseId);
  }

  @Get('movement-report')
  @ApiOperation({ summary: 'تقرير الحركات', description: 'تقرير حركات المخزون' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, description: 'إلى تاريخ' })
  @ApiQuery({ name: 'type', required: false, description: 'نوع الحركة' })
  @ApiQuery({ name: 'warehouseId', required: false, description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم جلب التقرير بنجاح' })
  getMovementReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('type') type?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.dashboardService.getMovementReport({ fromDate, toDate, type, warehouseId });
  }

  @Get('purchase-report')
  @ApiOperation({ summary: 'تقرير المشتريات', description: 'تقرير أوامر الشراء' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'من تاريخ' })
  @ApiQuery({ name: 'toDate', required: false, description: 'إلى تاريخ' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'معرف المورد' })
  @ApiQuery({ name: 'status', required: false, description: 'حالة الأمر' })
  @ApiResponse({ status: 200, description: 'تم جلب التقرير بنجاح' })
  getPurchaseReport(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.dashboardService.getPurchaseReport({ fromDate, toDate, supplierId, status });
  }
}
