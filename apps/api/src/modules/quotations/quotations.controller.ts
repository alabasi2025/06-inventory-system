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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto, QuotationQueryDto } from './dto';

@ApiTags('عروض الأسعار - Quotations')
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عرض سعر جديد' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء العرض بنجاح' })
  create(
    @Body() createDto: CreateQuotationDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.quotationsService.create(createDto, userId || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع عروض الأسعار' })
  @ApiResponse({ status: 200, description: 'قائمة عروض الأسعار' })
  findAll(@Query() query: QuotationQueryDto) {
    return this.quotationsService.findAll(query);
  }

  @Get('compare/:requestId')
  @ApiOperation({ summary: 'مقارنة عروض الأسعار لطلب شراء' })
  @ApiParam({ name: 'requestId', description: 'معرف طلب الشراء' })
  @ApiResponse({ status: 200, description: 'مقارنة العروض' })
  compareQuotations(@Param('requestId', ParseUUIDPipe) requestId: string) {
    return this.quotationsService.compareQuotations(requestId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب عرض سعر محدد' })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiResponse({ status: 200, description: 'بيانات العرض' })
  @ApiResponse({ status: 404, description: 'العرض غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث عرض سعر' })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiResponse({ status: 200, description: 'تم تحديث العرض بنجاح' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(id, updateDto);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'تسجيل استلام عرض السعر' })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiResponse({ status: 200, description: 'تم تسجيل الاستلام' })
  markReceived(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.markReceived(id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'قبول عرض السعر' })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم قبول العرض' })
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.quotationsService.accept(id, userId || 'system');
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'رفض عرض السعر' })
  @ApiParam({ name: 'id', description: 'معرف العرض' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiQuery({ name: 'reason', required: false, description: 'سبب الرفض' })
  @ApiResponse({ status: 200, description: 'تم رفض العرض' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('reason') reason?: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.quotationsService.reject(id, userId || 'system', reason);
  }
}
