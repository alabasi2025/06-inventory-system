import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, QueryPurchaseOrdersDto } from './dto';

@ApiTags('Purchase Orders - أوامر الشراء')
@Controller('api/v1/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة أوامر الشراء', description: 'جلب قائمة أوامر الشراء' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryPurchaseOrdersDto) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل أمر شراء', description: 'جلب تفاصيل أمر شراء محدد' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiResponse({ status: 200, description: 'تم جلب الأمر بنجاح' })
  @ApiResponse({ status: 404, description: 'الأمر غير موجود' })
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء أمر شراء', description: 'إنشاء أمر شراء جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الأمر بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث أمر شراء', description: 'تحديث أمر شراء (مسودة أو انتظار فقط)' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiResponse({ status: 200, description: 'تم تحديث الأمر بنجاح' })
  @ApiResponse({ status: 404, description: 'الأمر غير موجود' })
  @ApiResponse({ status: 409, description: 'لا يمكن تعديل أمر معتمد' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'إرسال للموافقة', description: 'إرسال أمر الشراء للموافقة' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiResponse({ status: 200, description: 'تم الإرسال بنجاح' })
  async submit(@Param('id') id: string) {
    return this.purchaseOrdersService.update(id, {});
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'اعتماد أمر شراء', description: 'اعتماد أمر الشراء' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiBody({ schema: { properties: { approvedBy: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'تم الاعتماد بنجاح' })
  @ApiResponse({ status: 409, description: 'الأمر ليس في حالة انتظار' })
  approve(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.purchaseOrdersService.approve(id, approvedBy);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'إرسال للمورد', description: 'إرسال أمر الشراء للمورد' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiResponse({ status: 200, description: 'تم الإرسال بنجاح' })
  @ApiResponse({ status: 409, description: 'الأمر غير معتمد' })
  send(@Param('id') id: string) {
    return this.purchaseOrdersService.send(id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'استلام البضاعة', description: 'تسجيل استلام بضاعة أمر الشراء' })
  @ApiParam({ name: 'id', description: 'معرف أمر الشراء' })
  @ApiBody({ schema: { properties: { warehouseId: { type: 'string' }, receivedBy: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'تم الاستلام بنجاح' })
  @ApiResponse({ status: 409, description: 'الأمر غير مرسل' })
  receive(
    @Param('id') id: string,
    @Body('warehouseId') warehouseId: string,
    @Body('receivedBy') receivedBy: string,
  ) {
    return this.purchaseOrdersService.receive(id, warehouseId, receivedBy);
  }
}
