import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('api/v1/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'فحص صحة النظام' })
  @ApiResponse({ status: 200, description: 'النظام يعمل بشكل صحيح' })
  @ApiResponse({ status: 503, description: 'النظام غير متاح' })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('ping')
  @ApiOperation({ summary: 'فحص سريع للاتصال' })
  @ApiResponse({ status: 200, description: 'pong' })
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
