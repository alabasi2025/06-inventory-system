import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto, QueryItemsDto } from './dto';

@ApiTags('Items - الأصناف')
@Controller('api/v1/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الأصناف', description: 'جلب قائمة الأصناف مع إمكانية البحث والتصفية' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryItemsDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل صنف', description: 'جلب تفاصيل صنف محدد' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'تم جلب الصنف بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'أرصدة الصنف', description: 'جلب أرصدة صنف في جميع المستودعات' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'تم جلب الأرصدة بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  getStock(@Param('id') id: string) {
    return this.itemsService.getStock(id);
  }

  @Get(':id/movements')
  @ApiOperation({ summary: 'حركات الصنف', description: 'جلب حركات صنف محدد' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'تم جلب الحركات بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  getMovements(@Param('id') id: string) {
    return this.itemsService.getMovements(id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة صنف', description: 'إنشاء صنف جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الصنف بنجاح' })
  @ApiResponse({ status: 409, description: 'كود الصنف أو الباركود موجود مسبقاً' })
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث صنف', description: 'تحديث بيانات صنف موجود' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'تم تحديث الصنف بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف صنف', description: 'حذف صنف موجود' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 204, description: 'تم حذف الصنف بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف الصنف لوجود أرصدة أو حركات' })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
