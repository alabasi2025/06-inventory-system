/**
 * نظام إدارة المخزون والمشتريات
 * Inventory and Procurement Management System
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('نظام إدارة المخزون والمشتريات')
    .setDescription(`
      ## Inventory and Procurement Management System API
      
      ### الوحدات الرئيسية:
      - **التصنيفات**: إدارة تصنيفات الأصناف
      - **وحدات القياس**: إدارة وحدات القياس
      - **المستودعات**: إدارة المستودعات والمخازن
      - **الأصناف**: إدارة الأصناف والمواد
      - **الموردين**: إدارة بيانات الموردين
      - **العقود**: إدارة عقود الموردين
      - **حركات المخزون**: استلام، صرف، تحويل، جرد
      - **طلبات الشراء**: إنشاء ومتابعة طلبات الشراء
      - **عروض الأسعار**: استلام ومقارنة عروض الأسعار
      - **أوامر الشراء**: إنشاء ومتابعة أوامر الشراء
      - **محاضر الاستلام**: تسجيل استلام البضائع
      - **التقارير**: تقارير المخزون والمشتريات
    `)
    .setVersion('1.0')
    .addTag('التصنيفات - Categories')
    .addTag('وحدات القياس - Units')
    .addTag('المستودعات - Warehouses')
    .addTag('الأصناف - Items')
    .addTag('الموردين - Suppliers')
    .addTag('عقود الموردين - Contracts')
    .addTag('حركات المخزون - Movements')
    .addTag('طلبات الشراء - Purchase Requests')
    .addTag('عروض الأسعار - Quotations')
    .addTag('أوامر الشراء - Purchase Orders')
    .addTag('محاضر الاستلام - Goods Receipts')
    .addTag('التقارير - Reports')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Swagger documentation: http://localhost:${port}/${globalPrefix}/docs`,
  );
}

bootstrap();
