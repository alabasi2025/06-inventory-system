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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto';

@ApiTags('عقود الموردين - Contracts')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء عقد جديد' })
  @ApiResponse({ status: 201, description: 'تم إنشاء العقد بنجاح' })
  @ApiResponse({ status: 404, description: 'المورد غير موجود' })
  @ApiResponse({ status: 409, description: 'رقم العقد موجود مسبقاً' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع العقود' })
  @ApiQuery({ name: 'supplierId', required: false, description: 'معرف المورد' })
  @ApiResponse({ status: 200, description: 'قائمة العقود' })
  findAll(@Query('supplierId') supplierId?: string) {
    return this.contractsService.findAll(supplierId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'جلب العقود المنتهية قريباً' })
  @ApiQuery({ name: 'days', required: false, description: 'عدد الأيام (افتراضي 30)' })
  @ApiResponse({ status: 200, description: 'العقود المنتهية قريباً' })
  getExpiringSoon(@Query('days') days?: number) {
    return this.contractsService.getExpiringSoon(days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب عقد محدد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  @ApiResponse({ status: 200, description: 'بيانات العقد' })
  @ApiResponse({ status: 404, description: 'العقد غير موجود' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث عقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  @ApiResponse({ status: 200, description: 'تم تحديث العقد بنجاح' })
  @ApiResponse({ status: 404, description: 'العقد غير موجود' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'حذف عقد' })
  @ApiParam({ name: 'id', description: 'معرف العقد' })
  @ApiResponse({ status: 204, description: 'تم حذف العقد بنجاح' })
  @ApiResponse({ status: 404, description: 'العقد غير موجود' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.remove(id);
  }
}
