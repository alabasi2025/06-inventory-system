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
import { MovementsService } from './movements.service';
import { CreateMovementDto, UpdateMovementDto, MovementQueryDto } from './dto';

@ApiTags('حركات المخزون - Movements')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء حركة مخزون جديدة' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 201, description: 'تم إنشاء الحركة بنجاح' })
  @ApiResponse({ status: 400, description: 'بيانات غير صحيحة' })
  @ApiResponse({ status: 404, description: 'المستودع أو الصنف غير موجود' })
  create(
    @Body() createMovementDto: CreateMovementDto,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.movementsService.create(createMovementDto, userId || 'system');
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع حركات المخزون' })
  @ApiResponse({ status: 200, description: 'قائمة الحركات' })
  findAll(@Query() query: MovementQueryDto) {
    return this.movementsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب حركة محددة' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiResponse({ status: 200, description: 'بيانات الحركة' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.movementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث حركة (مسودة فقط)' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiResponse({ status: 200, description: 'تم تحديث الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'لا يمكن تعديل حركة مؤكدة' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovementDto: UpdateMovementDto,
  ) {
    return this.movementsService.update(id, updateMovementDto);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'تأكيد حركة المخزون' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم تأكيد الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'الحركة مؤكدة مسبقاً' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.movementsService.confirm(id, userId || 'system');
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'إلغاء حركة المخزون' })
  @ApiParam({ name: 'id', description: 'معرف الحركة' })
  @ApiHeader({ name: 'x-user-id', description: 'معرف المستخدم', required: false })
  @ApiResponse({ status: 200, description: 'تم إلغاء الحركة بنجاح' })
  @ApiResponse({ status: 404, description: 'الحركة غير موجودة' })
  @ApiResponse({ status: 409, description: 'الحركة ملغاة مسبقاً' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.movementsService.cancel(id, userId || 'system');
  }
}
