import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto, WarehouseQueryDto } from './dto';

@ApiTags('المستودعات - Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مستودع جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المستودع بنجاح' })
  @ApiResponse({ status: 409, description: 'المستودع موجود مسبقاً' })
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع المستودعات' })
  @ApiResponse({ status: 200, description: 'قائمة المستودعات' })
  findAll(@Query() query: WarehouseQueryDto) {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب مستودع محدد' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'بيانات المستودع' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'جلب أرصدة مستودع محدد' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'أرصدة المستودع' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  getStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.getStock(id);
  }

  @Get(':id/stock/summary')
  @ApiOperation({ summary: 'جلب ملخص أرصدة مستودع محدد' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'ملخص أرصدة المستودع' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  getStockSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.getStockSummary(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث مستودع' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 200, description: 'تم تحديث المستودع بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مستودع' })
  @ApiParam({ name: 'id', description: 'معرف المستودع' })
  @ApiResponse({ status: 204, description: 'تم حذف المستودع بنجاح' })
  @ApiResponse({ status: 404, description: 'المستودع غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف المستودع' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.remove(id);
  }
}
