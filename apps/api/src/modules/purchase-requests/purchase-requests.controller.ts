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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader } from '@nestjs/swagger';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePurchaseRequestDto, UpdatePurchaseRequestDto, PurchaseRequestQueryDto, ApproveRejectDto } from './dto';

@ApiTags('طلبات الشراء - Purchase Requests')
@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestsService: PurchaseRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء طلب شراء جديد' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء الطلب بنجاح' })
  create(
    @Body() createDto: CreatePurchaseRequestDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseRequestsService.create(createDto, userId || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع طلبات الشراء' })
  @ApiResponse({ status: 200, description: 'قائمة طلبات الشراء' })
  findAll(@Query() query: PurchaseRequestQueryDto) {
    return this.purchaseRequestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب طلب شراء محدد' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'بيانات الطلب' })
  @ApiResponse({ status: 404, description: 'الطلب غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseRequestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث طلب شراء (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiResponse({ status: 200, description: 'تم تحديث الطلب بنجاح' })
  @ApiResponse({ status: 409, description: 'لا يمكن تعديل الطلب' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.update(id, updateDto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'تقديم طلب الشراء للموافقة' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم تقديم الطلب بنجاح' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseRequestsService.submit(id, userId || 'system');
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'الموافقة على طلب الشراء' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تمت الموافقة على الطلب' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseRequestsService.approve(id, userId || 'system', dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'رفض طلب الشراء' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم رفض الطلب' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveRejectDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseRequestsService.reject(id, userId || 'system', dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء طلب الشراء' })
  @ApiParam({ name: 'id', description: 'معرف الطلب' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم إلغاء الطلب' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.purchaseRequestsService.cancel(id, userId || 'system');
  }
}
