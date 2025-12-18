import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, QueryUnitsDto } from './dto';

@ApiTags('Units - وحدات القياس')
@Controller('api/v1/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة وحدات القياس', description: 'جلب قائمة وحدات القياس' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryUnitsDto) {
    return this.unitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل وحدة قياس', description: 'جلب تفاصيل وحدة قياس محددة' })
  @ApiParam({ name: 'id', description: 'معرف الوحدة' })
  @ApiResponse({ status: 200, description: 'تم جلب الوحدة بنجاح' })
  @ApiResponse({ status: 404, description: 'الوحدة غير موجودة' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة وحدة قياس', description: 'إنشاء وحدة قياس جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الوحدة بنجاح' })
  @ApiResponse({ status: 409, description: 'كود الوحدة موجود مسبقاً' })
  create(@Body() dto: CreateUnitDto) {
    return this.unitsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث وحدة قياس', description: 'تحديث بيانات وحدة قياس موجودة' })
  @ApiParam({ name: 'id', description: 'معرف الوحدة' })
  @ApiResponse({ status: 200, description: 'تم تحديث الوحدة بنجاح' })
  @ApiResponse({ status: 404, description: 'الوحدة غير موجودة' })
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف وحدة قياس', description: 'حذف وحدة قياس موجودة' })
  @ApiParam({ name: 'id', description: 'معرف الوحدة' })
  @ApiResponse({ status: 204, description: 'تم حذف الوحدة بنجاح' })
  @ApiResponse({ status: 404, description: 'الوحدة غير موجودة' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف الوحدة لوجود أصناف مرتبطة' })
  remove(@Param('id') id: string) {
    return this.unitsService.remove(id);
  }
}
