import { Controller, Get, Post, Put, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto, QueryMovementsDto } from './dto';

@ApiTags('Movements - حركات المخزون')
@Controller('api/v1/movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  @ApiOperation({ summary: 'قائمة الحركات', description: 'جلب قائمة حركات المخزون' })
  @ApiResponse({ status: 200, description: 'تم جلب القائمة بنجاح' })
  findAll(@Query() query: QueryMovementsDto) {
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل حركة', description: 'جلب تفاصيل حركة محددة' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiResponse({ status: 200, description: 'تم جلب الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  findOne(@Param('id') id: string) {
    return this.movementsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء حركة', description: 'إنشاء حركة مخزون جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء الحركة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  create(@Body() dto: CreateMovementDto) {
    return this.movementsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث حركة', description: 'تحديث حركة مخزون (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiResponse({ status: 200, description: 'تم تحديث الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'لا يمكن تعديل حركة مؤكدة' })
  update(@Param('id') id: string, @Body() dto: UpdateMovementDto) {
    return this.movementsService.update(id, dto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'تأكيد حركة', description: 'تأكيد حركة مخزون وتحديث الأرصدة' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiBody({ schema: { properties: { confirmedBy: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'تم تأكيد الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'الحركة مؤكدة مسبقاً' })
  confirm(@Param('id') id: string, @Body('confirmedBy') confirmedBy: string) {
    return this.movementsService.confirm(id, confirmedBy);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'إلغاء حركة', description: 'إلغاء حركة مخزون (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiResponse({ status: 200, description: 'تم إلغاء الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'لا يمكن إلغاء حركة مؤكدة' })
  cancel(@Param('id') id: string) {
    return this.movementsService.cancel(id);
  }
}
