/**
 * نظام إدارة المخزون والمشتريات - Inventory Management System
 * Backend API Server
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('نظام إدارة المخزون والمشتريات')
    .setDescription('Inventory & Procurement Management System API')
    .setVersion('1.0')
    .addTag('Dashboard - لوحة التحكم')
    .addTag('Categories - التصنيفات')
    .addTag('Units - وحدات القياس')
    .addTag('Warehouses - المستودعات')
    .addTag('Items - الأصناف')
    .addTag('Suppliers - الموردين')
    .addTag('Movements - حركات المخزون')
    .addTag('Purchase Orders - أوامر الشراء')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.API_PORT || 3006;
  await app.listen(port);
  
  Logger.log(`🚀 نظام المخزون يعمل على: http://localhost:${port}`);
  Logger.log(`📚 Swagger API Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
