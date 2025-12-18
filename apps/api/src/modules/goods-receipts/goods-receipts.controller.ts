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
import { GoodsReceiptsService } from './goods-receipts.service';
import { CreateGoodsReceiptDto, UpdateGoodsReceiptDto, GoodsReceiptQueryDto } from './dto';

@ApiTags('محاضر الاستلام - Goods Receipts')
@Controller('goods-receipts')
export class GoodsReceiptsController {
  constructor(private readonly goodsReceiptsService: GoodsReceiptsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء محضر استلام جديد' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء المحضر بنجاح' })
  create(
    @Body() createDto: CreateGoodsReceiptDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.goodsReceiptsService.create(createDto, userId || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع محاضر الاستلام' })
  @ApiResponse({ status: 200, description: 'قائمة محاضر الاستلام' })
  findAll(@Query() query: GoodsReceiptQueryDto) {
    return this.goodsReceiptsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب محضر استلام محدد' })
  @ApiParam({ name: 'id', description: 'معرف المحضر' })
  @ApiResponse({ status: 200, description: 'بيانات المحضر' })
  @ApiResponse({ status: 404, description: 'المحضر غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.goodsReceiptsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث محضر استلام (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف المحضر' })
  @ApiResponse({ status: 200, description: 'تم تحديث المحضر بنجاح' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateGoodsReceiptDto,
  ) {
    return this.goodsReceiptsService.update(id, updateDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'تأكيد محضر الاستلام وتحديث المخزون' })
  @ApiParam({ name: 'id', description: 'معرف المحضر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم تأكيد المحضر' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.goodsReceiptsService.confirm(id, userId || 'system');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء محضر الاستلام' })
  @ApiParam({ name: 'id', description: 'معرف المحضر' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم إلغاء المحضر' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.goodsReceiptsService.cancel(id, userId || 'system');
  }
}
