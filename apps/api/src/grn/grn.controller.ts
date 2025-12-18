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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GrnService } from './grn.service';
import { CreateGrnDto, UpdateGrnDto } from './dto';

@ApiTags('سندات استلام البضائع - GRN')
@Controller('api/v1/grn')
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء سند استلام جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء سند الاستلام بنجاح' })
  create(@Body() createGrnDto: CreateGrnDto) {
    return this.grnService.create(createGrnDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع سندات الاستلام' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: String })
  @ApiQuery({ name: 'warehouseId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.grnService.findAll({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      status,
      supplierId,
      warehouseId,
      fromDate,
      toDate,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'إحصائيات سندات الاستلام' })
  getStats() {
    return this.grnService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب سند استلام بالمعرف' })
  @ApiResponse({ status: 200, description: 'تم جلب سند الاستلام بنجاح' })
  @ApiResponse({ status: 404, description: 'سند الاستلام غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.grnService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث سند استلام' })
  @ApiResponse({ status: 200, description: 'تم تحديث سند الاستلام بنجاح' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateGrnDto: UpdateGrnDto,
  ) {
    return this.grnService.update(id, updateGrnDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'اعتماد سند الاستلام وتحديث المخزون' })
  @ApiResponse({ status: 200, description: 'تم اعتماد سند الاستلام بنجاح' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('inspectedBy') inspectedBy: string,
  ) {
    return this.grnService.approve(id, inspectedBy || 'system');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف سند استلام' })
  @ApiResponse({ status: 200, description: 'تم حذف سند الاستلام بنجاح' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.grnService.remove(id);
  }
}
