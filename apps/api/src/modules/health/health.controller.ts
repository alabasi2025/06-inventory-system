import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health Check')
@Controller('v1/health')
@SkipThrottle() // Health check should not be rate limited
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'فحص صحة النظام' })
  @ApiResponse({ status: 200, description: 'النظام يعمل بشكل صحيح' })
  @ApiResponse({ status: 503, description: 'النظام غير متاح' })
  async check() {
    const startTime = Date.now();
    let dbStatus = 'healthy';
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
    }

    return {
      status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        api: {
          status: 'healthy',
          latency: `${Date.now() - startTime}ms`,
        },
      },
    };
  }
}
