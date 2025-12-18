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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto, CategoryResponseDto } from './dto';

@ApiTags('التصنيفات - Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء تصنيف جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء التصنيف بنجاح', type: CategoryResponseDto })
  @ApiResponse({ status: 409, description: 'التصنيف موجود مسبقاً' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع التصنيفات' })
  @ApiResponse({ status: 200, description: 'قائمة التصنيفات' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get('tree')
  @ApiOperation({ summary: 'جلب شجرة التصنيفات' })
  @ApiResponse({ status: 200, description: 'شجرة التصنيفات' })
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب تصنيف محدد' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 200, description: 'بيانات التصنيف', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث تصنيف' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 200, description: 'تم تحديث التصنيف بنجاح', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف تصنيف' })
  @ApiParam({ name: 'id', description: 'معرف التصنيف' })
  @ApiResponse({ status: 204, description: 'تم حذف التصنيف بنجاح' })
  @ApiResponse({ status: 404, description: 'التصنيف غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف التصنيف' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
