import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderQueryDto } from './dto';

@ApiTags('أوامر الشراء - Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء أمر شراء جديد' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء الأمر بنجاح' })
  create(
    @Body() createDto: CreatePurchaseOrderDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseOrdersService.create(createDto, userId || 'system');
  }

  @Post('from-quotation/:quotationId')
  @ApiOperation({ summary: 'إنشاء أمر شراء من عرض سعر مقبول' })
  @ApiParam({ name: 'quotationId', description: 'معرف عرض السعر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء الأمر بنجاح' })
  createFromQuotation(
    @Param('quotationId', ParseUUIDPipe) quotationId: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseOrdersService.createFromQuotation(quotationId, userId || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع أوامر الشراء' })
  @ApiResponse({ status: 200, description: 'قائمة أوامر الشراء' })
  findAll(@Query() query: PurchaseOrderQueryDto) {
    return this.purchaseOrdersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب أمر شراء محدد' })
  @ApiParam({ name: 'id', description: 'معرف الأمر' })
  @ApiResponse({ status: 200, description: 'بيانات الأمر' })
  @ApiResponse({ status: 404, description: 'الأمر غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث أمر شراء (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الأمر' })
  @ApiResponse({ status: 200, description: 'تم تحديث الأمر بنجاح' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(id, updateDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'اعتماد أمر الشراء' })
  @ApiParam({ name: 'id', description: 'معرف الأمر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم اعتماد الأمر' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseOrdersService.approve(id, userId || 'system');
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'إرسال أمر الشراء للمورد' })
  @ApiParam({ name: 'id', description: 'معرف الأمر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم إرسال الأمر' })
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseOrdersService.send(id, userId || 'system');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء أمر الشراء' })
  @ApiParam({ name: 'id', description: 'معرف الأمر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiQuery({ name: 'reason', required: false, description: 'سبب الإلغاء' })
  @ApiResponse({ status: 200, description: 'تم إلغاء الأمر' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseOrdersService.cancel(id, userId || 'system', reason);
  }
}
