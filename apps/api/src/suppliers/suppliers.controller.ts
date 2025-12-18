import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto, QuerySuppliersDto } from './dto';

@ApiTags('Suppliers - الموردين')
@Controller('api/v1/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الموردين', description: 'جلب قائمة الموردين' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QuerySuppliersDto) {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل مورد', description: 'جلب تفاصيل مورد محدد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تم جلب المورد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'أوامر شراء المورد', description: 'جلب أوامر الشراء الخاصة بمورد' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تم جلب الأوامر بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  getOrders(@Param('id') id: string) {
    return this.suppliersService.getOrders(id);
  }

  @Post()
  @ApiOperation({ summary: 'إضافة مورد', description: 'إنشاء مورد جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء المورد بنجاح' })
  @ApiResponse({ status: 409, description: 'كود المورد موجود مسبقاً' })
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث مورد', description: 'تحديث بيانات مورد موجود' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'تم تحديث المورد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف مورد', description: 'حذف مورد موجود' })
  @ApiParam({ name: 'id', description: 'معرف المورد' })
  @ApiResponse({ status: 204, description: 'تم حذف المورد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف المورد لوجود أوامر شراء' })
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}
