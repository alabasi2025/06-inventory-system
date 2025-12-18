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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, UpdateItemDto, ItemQueryDto } from './dto';

@ApiTags('الأصناف - Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء صنف جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الصنف بنجاح' })
  @ApiResponse({ status: 409, description: 'الصنف موجود مسبقاً' })
  @ApiResponse({ status: 404, description: 'التصنيف أو وحدة القياس غير موجودة' })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع الأصناف' })
  @ApiResponse({ status: 200, description: 'قائمة الأصناف' })
  findAll(@Query() query: ItemQueryDto) {
    return this.itemsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب صنف محدد' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'بيانات الصنف' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.findOne(id);
  }

  @Get(':id/stock')
  @ApiOperation({ summary: 'جلب أرصدة صنف في جميع المستودعات' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'أرصدة الصنف' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  getStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.getStock(id);
  }

  @Get(':id/movements')
  @ApiOperation({ summary: 'جلب حركات صنف محدد' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiQuery({ name: 'page', required: false, description: 'رقم الصفحة' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر' })
  @ApiResponse({ status: 200, description: 'حركات الصنف' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  getMovements(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.itemsService.getMovements(id, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث صنف' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 200, description: 'تم تحديث الصنف بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف صنف' })
  @ApiParam({ name: 'id', description: 'معرف الصنف' })
  @ApiResponse({ status: 204, description: 'تم حذف الصنف بنجاح' })
  @ApiResponse({ status: 404, description: 'الصنف غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف الصنف' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.remove(id);
  }
}
