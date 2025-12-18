import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto, QueryWarehousesDto } from './dto';

@ApiTags('Warehouses - المستودعات')
@Controller('api/v1/warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة المستودعات', description: 'جلب قائمة المستودعات' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryWarehousesDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مستودع', description: 'جلب تفاصيل مستودع محدد' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم جلب المستودع بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'أرصدة المستودع', description: 'جلب أرصدة الأصناف في مستودع محدد' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم جلب الأرصدة بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  getStock(@Param('id') id: string) {
    return this.warehousesService.getStock(id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة مستودع', description: 'إنشاء مستودع جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المستودع بنجاح' })
  @ApiResponse({ status: 409, description: 'كود المستودع موجود مسبقاً' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث مستودع', description: 'تحديث بيانات مستودع موجود' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم تحديث المستودع بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مستودع', description: 'حذف مستودع موجود' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 204, description: 'تم حذف المستودع بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف المستودع لوجود أرصدة' })
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
