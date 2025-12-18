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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, UnitQueryDto } from './dto';

@ApiTags('وحدات القياس - Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء وحدة قياس جديدة' })
  @ApiResponse({ status: 201, description: 'تم إنشاء وحدة القياس بنجاح' })
  @ApiResponse({ status: 409, description: 'وحدة القياس موجودة مسبقاً' })
  create(@Body() createUnitDto: CreateUnitDto) {
    return this.unitsService.create(createUnitDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع وحدات القياس' })
  @ApiResponse({ status: 200, description: 'قائمة وحدات القياس' })
  findAll(@Query() query: UnitQueryDto) {
    return this.unitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب وحدة قياس محددة' })
  @ApiParam({ name: 'id', description: 'معرف وحدة القياس' })
  @ApiResponse({ status: 200, description: 'بيانات وحدة القياس' })
  @ApiResponse({ status: 404, description: 'وحدة القياس غير موجودة' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث وحدة قياس' })
  @ApiParam({ name: 'id', description: 'معرف وحدة القياس' })
  @ApiResponse({ status: 200, description: 'تم تحديث وحدة القياس بنجاح' })
  @ApiResponse({ status: 404, description: 'وحدة القياس غير موجودة' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف وحدة قياس' })
  @ApiParam({ name: 'id', description: 'معرف وحدة القياس' })
  @ApiResponse({ status: 204, description: 'تم حذف وحدة القياس بنجاح' })
  @ApiResponse({ status: 404, description: 'وحدة القياس غير موجودة' })
  @ApiResponse({ status: 409, description: 'لا يمكن حذف وحدة القياس' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.unitsService.remove(id);
  }
}
