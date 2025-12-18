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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, SupplierQueryDto } from './dto';

@ApiTags('الموردين - Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مورد جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المورد بنجاح' })
  @ApiResponse({ status: 409, description: 'المورد موجود مسبقاً' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع الموردين' })
  @ApiResponse({ status: 200, description: 'قائمة الموردين' })
  findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب مورد محدد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'بيانات المورد' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'جلب أوامر شراء مورد محدد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiQuery({ name: 'page', required: false, description: 'رقم الصفحة' })
  @ApiQuery({ name: 'limit', required: false, description: 'عدد العناصر' })
  @ApiResponse({ status: 200, description: 'أوامر الشراء' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  getOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.suppliersService.getOrders(id, page, limit);
  }

  @Get(':id/rating')
  @ApiOperation({ summary: 'جلب تقييم مورد محدد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تقييم المورد' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  getRating(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.getRating(id);
  }

  @Post(':id/rating/update')
  @ApiOperation({ summary: 'تحديث تقييم مورد محدد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تم تحديث التقييم' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  updateRating(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.updateRating(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث مورد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تم تحديث المورد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مورد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 204, description: 'تم حذف المورد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف المورد' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }
}
