import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoriesDto } from './dto';

@ApiTags('Categories - التصنيفات')
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة التصنيفات', description: 'جلب قائمة التصنيفات مع إمكانية البحث والتصفية' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'شجرة التصنيفات', description: 'جلب التصنيفات على شكل شجرة هرمية' })
  @ApiResponse({ status: 200, description: 'تم جلب الشجرة بنجاح' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل تصنيف', description: 'جلب تفاصيل تصنيف محدد' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 200, description: 'تم جلب التصنيف بنجاح' })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة تصنيف', description: 'إنشاء تصنيف جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء التصنيف بنجاح' })
  @ApiResponse({ status: 409, description: 'كود التصنيف موجود مسبقاً' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث تصنيف', description: 'تحديث بيانات تصنيف موجود' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 200, description: 'تم تحديث التصنيف بنجاح' })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تصنيف', description: 'حذف تصنيف موجود' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 204, description: 'تم حذف التصنيف بنجاح' })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف التصنيف لوجود بيانات مرتبطة' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
